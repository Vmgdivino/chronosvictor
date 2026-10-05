import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Fora de catálogo</p>
      <h1 className="mt-3 font-display text-4xl">Essa cronologia não existe.</h1>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
        Voltar às franquias
      </Link>
    </div>
  );
}
