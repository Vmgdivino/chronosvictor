"use client";

import { getFranchise } from "@/lib/franchises";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const HOME_ACCENT = "#e7c36a";

function motionFor(slug: string | null) {
  if (slug === "velozes" || slug === "jurassic") return "rush";
  if (slug === "star-wars") return "warp";
  if (slug === "marvel" || slug === "dceu" || slug === "harry-potter") return "orbit";
  return "drift";
}

export function CinemaBackdrop() {
  const pathname = usePathname();
  const match = pathname.match(/^\/franquia\/([^/]+)/);
  const slug = match ? decodeURIComponent(match[1]) : null;
  const franchise = slug ? getFranchise(slug) : undefined;
  const accent = franchise?.accent ?? HOME_ACCENT;
  const motion = motionFor(franchise?.slug ?? null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x07080c, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080c, 0.052);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 0.55, 9);

    const color = new THREE.Color(accent);
    const count = 760;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 30;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pointsMaterial = new THREE.PointsMaterial({
      color,
      size: motion === "warp" ? 0.06 : 0.038,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    const knotMaterial = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: motion === "warp" ? 0.08 : 0.32,
    });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.55, 0.3, 160, 14), knotMaterial);
    knot.position.set(3.1, 0.15, -1.6);
    scene.add(knot);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.012, 12, 96), ringMaterial);
    ring.rotation.x = Math.PI / 2.5;
    ring.position.set(-3.2, 0.3, -0.4);
    scene.add(ring);

    const grid = new THREE.GridHelper(50, 30, color, new THREE.Color("#1a1c26"));
    grid.position.y = -2.7;
    scene.add(grid);

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
      const speed = motion === "rush" ? 2.6 : motion === "warp" ? 1.7 : 1;
      points.rotation.y += delta * 0.045 * speed;
      knot.rotation.x += delta * 0.16 * speed;
      knot.rotation.y += delta * 0.24;
      ring.rotation.z += delta * 0.18 * speed;
      if (motion === "rush" || motion === "warp") {
        const attribute = geometry.getAttribute("position");
        if (attribute instanceof THREE.BufferAttribute) {
          const array = attribute.array as Float32Array;
          const step = delta * (motion === "rush" ? 7.5 : 13);
          for (let index = 2; index < array.length; index += 3) {
            array[index] += step;
            if (array[index] > 13) array[index] = -13;
          }
          attribute.needsUpdate = true;
        }
      }
      camera.position.x = Math.sin(elapsed * 0.18) * 0.5;
      camera.lookAt(0, 0.1, 0);
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
      grid.geometry.dispose();
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      gridMaterials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, [accent, motion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="absolute inset-0 bg-black/40 bg-[radial-gradient(ellipse_at_center,rgba(7,8,12,0.2)_0%,rgba(7,8,12,0.55)_48%,#07080c_100%)]" />
    </div>
  );
}
