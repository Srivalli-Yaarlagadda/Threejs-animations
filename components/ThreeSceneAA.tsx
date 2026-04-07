"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function AntiAliasingCompare() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let width = window.innerWidth / 2;
    let height = window.innerHeight;

    // ---------- COMMON SETUP ----------
    const createScene = (container: HTMLDivElement, antialias: boolean) => {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x262626);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 10);

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          wireframe: true,
        })
      );
      scene.add(cube);

      const renderer = new THREE.WebGLRenderer({ antialias });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      return { scene, camera, cube, renderer };
    };

    if (!leftRef.current || !rightRef.current) return;

    // ❌ WITHOUT anti-aliasing
    const left = createScene(leftRef.current, false);

    // ✅ WITH anti-aliasing
    const right = createScene(rightRef.current, true);

    // ---------- ANIMATION ----------
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      left.cube.rotation.x += 0.005;
      left.cube.rotation.y += 0.01;

      right.cube.rotation.x += 0.005;
      right.cube.rotation.y += 0.01;

      left.renderer.render(left.scene, left.camera);
      right.renderer.render(right.scene, right.camera);
    };

    animate();

    // ---------- RESIZE ----------
    const handleResize = () => {
      width = window.innerWidth / 2;
      height = window.innerHeight;

      [left, right].forEach(({ camera, renderer }) => {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
    };

    window.addEventListener("resize", handleResize);

    // ---------- CLEANUP ----------
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);

      left.renderer.dispose();
      right.renderer.dispose();
    };
  }, []);

  return (
    <div className="flex w-full h-screen">
      {/* ❌ Jagged */}
      <div className="w-1/2 h-full relative" ref={leftRef}>
        <p className="absolute top-2 left-2 text-white text-sm">
          Without Anti-Aliasing (Jagged)
        </p>
      </div>

      {/* ✅ Smooth */}
      <div className="w-1/2 h-full relative" ref={rightRef}>
        <p className="absolute top-2 left-2 text-white text-sm">
          With Anti-Aliasing (Smooth)
        </p>
      </div>
    </div>
  );
}