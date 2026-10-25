"use client";

import { Download } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const DISMISS_KEY = "chronosvictor.update.dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallValue = {
  download: () => void;
  installed: boolean;
};

const InstallContext = createContext<InstallValue | null>(null);

function standalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function iosDevice() {
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1);
}

export function AppInstall({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [help, setHelp] = useState(false);
  const [safariHref, setSafariHref] = useState<string | null>(null);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const sync = () => setInstalled(standalone());
    sync();
    media.addEventListener("change", sync);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    let workerStop = false;
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").then((registration) => {
        if (workerStop) return;
        const watch = (worker: ServiceWorker | null) => {
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        };
        watch(registration.installing);
        if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
        registration.addEventListener("updatefound", () => watch(registration.installing));
      }).catch(() => undefined);
    }

    let current = "";
    let versionStop = false;
    const checkVersion = async () => {
      try {
        const response = await fetch("/api/versao", { cache: "no-store" });
        if (!response.ok || versionStop) return;
        const body = (await response.json()) as { id?: unknown };
        const id = typeof body.id === "string" ? body.id : "";
        if (!id) return;
        if (!current) {
          current = id;
          return;
        }
        if (id !== current && sessionStorage.getItem(DISMISS_KEY) !== id) {
          sessionStorage.setItem("chronosvictor.update.current", id);
          setUpdateReady(true);
        }
      } catch {
        // A failed check just waits for the next one.
      }
    };
    void checkVersion();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkVersion();
    }, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      workerStop = true;
      versionStop = true;
      window.clearInterval(timer);
      media.removeEventListener("change", sync);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  function pageInSafari() {
    const page = new URL(window.location.href);
    page.hash = "";
    return `x-safari-${page.href}`;
  }

  async function download() {
    if (iosDevice() && !standalone()) {
      setHelp(false);
      setSafariHref(pageInSafari());
      return;
    }
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      setPromptEvent(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    setHelp(true);
  }

  function dismissUpdate() {
    const id = sessionStorage.getItem("chronosvictor.update.current");
    if (id) sessionStorage.setItem(DISMISS_KEY, id);
    setUpdateReady(false);
  }

  function applyUpdate() {
    const waiting = navigator.serviceWorker?.controller;
    waiting?.postMessage("skip-waiting");
    void navigator.serviceWorker?.getRegistration().then((registration) => {
      registration?.waiting?.postMessage("skip-waiting");
    });
    window.location.reload();
  }

  return (
    <InstallContext.Provider value={{ download, installed }}>
      {children}
      {updateReady ? (
        <div className="fixed inset-x-0 top-20 z-[60] flex justify-center px-4" role="status">
          <div className="w-full max-w-md rounded-3xl border border-gold/30 bg-[#0c0e14]/95 p-4 shadow-2xl backdrop-blur-xl">
            <p className="font-display text-lg">Há uma atualização</p>
            <p className="mt-1 text-sm text-muted">Quer atualizar o ChronosVictor para a versão mais recente?</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={applyUpdate}
                className="min-h-11 flex-1 rounded-full bg-gold px-4 text-sm font-semibold text-black"
              >
                Atualizar
              </button>
              <button
                type="button"
                onClick={dismissUpdate}
                className="min-h-11 flex-1 rounded-full border border-white/10 px-4 text-sm text-white/80"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {help ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onClick={() => setHelp(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-title"
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c0e14] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="install-title" className="font-display text-xl">Descarregar</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              No menu do navegador, escolha Instalar aplicação ou Adicionar ao ecrã inicial.
            </p>
            <button
              type="button"
              onClick={() => setHelp(false)}
              className="mt-4 min-h-11 w-full rounded-full bg-gold px-4 text-sm font-semibold text-black"
            >
              Entendi
            </button>
          </div>
        </div>
      ) : null}
      {safariHref ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onClick={() => setSafariHref(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="safari-title"
            className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0c0e14] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="safari-title" className="font-display text-xl">Abrir no Safari</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">Para descarregar no iPhone, esta página abre direto no Safari.</p>
            <a
              href={safariHref}
              className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-black"
            >
              Abrir no Safari
            </a>
            <button
              type="button"
              onClick={() => setSafariHref(null)}
              className="mt-2 min-h-11 w-full rounded-full border border-white/10 px-4 text-sm text-white/80"
            >
              Agora não
            </button>
          </div>
        </div>
      ) : null}
    </InstallContext.Provider>
  );
}

export function InstallButton() {
  const install = useContext(InstallContext);
  if (!install || install.installed) return null;

  return (
    <button
      type="button"
      onClick={install.download}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold transition hover:bg-gold/20"
      aria-label="Descarregar a aplicação"
      title="Descarregar"
    >
      <Download className="h-4 w-4" aria-hidden />
    </button>
  );
}
