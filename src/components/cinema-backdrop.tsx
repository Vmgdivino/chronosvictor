"use client";

import { Poster } from "@/components/poster";
import { useScene } from "@/context/scene-context";
import { franchises, getFranchise } from "@/lib/franchises";
import { motionFor } from "@/lib/scene";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const HOME_ACCENT = "#e7c36a";

export function CinemaBackdrop() {
  const pathname = usePathname();
  const { preview } = useScene();
  const match = pathname.match(/^\/franquia\/([^/]+)/);
  const slug = match ? decodeURIComponent(match[1]) : null;
  const franchise = slug ? getFranchise(slug) : undefined;
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (franchise || preview) return;
    const id = window.setInterval(() => setCycle((value) => value + 1), 9000);
    return () => window.clearInterval(id);
  }, [franchise, preview]);

  const roaming = franchises[cycle % franchises.length] ?? franchises[0];
  const image = franchise?.backdrop ?? preview?.image ?? roaming?.backdrop;
  const motion = franchise ? motionFor(franchise.slug) : (preview?.motion ?? motionFor(roaming?.slug ?? null));
  const accent = franchise?.accent ?? preview?.accent ?? HOME_ACCENT;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080c, 0.045);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 0.35, 8.2);

    const color = new THREE.Color(accent);
    const count = 520;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 28;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({
      color,
      size: motion === "warp" ? 0.055 : 0.034,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    const knotMaterial = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, 0.22, 140, 12), knotMaterial);
    knot.position.set(3.4, 0.2, -1.2);
    scene.add(knot);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.012, 12, 90), ringMaterial);
    ring.rotation.x = Math.PI / 2.4;
    ring.position.set(-3.4, -0.15, -0.2);
    scene.add(ring);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let running = true;
    let last = performance.now();

    const tick = () => {
      if (!running) return;
      const now = performance.now();
      const delta = reduced ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      const elapsed = now / 1000;
      const speed = motion === "rush" ? 2.4 : motion === "warp" ? 1.6 : 1;
      points.rotation.y += delta * 0.04 * speed;
      knot.rotation.x += delta * 0.14 * speed;
      knot.rotation.y += delta * 0.22;
      ring.rotation.z += delta * 0.16 * speed;
      if (motion === "rush" || motion === "warp") {
        const attribute = geometry.getAttribute("position");
        if (attribute instanceof THREE.BufferAttribute) {
          const array = attribute.array as Float32Array;
          const step = delta * (motion === "rush" ? 6.5 : 11);
          for (let index = 2; index < array.length; index += 3) {
            array[index] += step;
            if (array[index] > 12) array[index] = -12;
          }
          attribute.needsUpdate = true;
        }
      }
      camera.position.x = Math.sin(elapsed * 0.16) * 0.35;
      camera.lookAt(0, 0.05, 0);
      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      pointsMaterial.dispose();
      knot.geometry.dispose();
      knotMaterial.dispose();
      ring.geometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, [accent, motion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="cinema-stage absolute inset-[-10%]">
        {image ? (
          <Poster key={image} src={image} alt="" className={`cinema-scene cinema-scene-${motion}`} />
        ) : null}
      </div>
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div className="cinema-shade absolute inset-0" />
    </div>
  );
}
