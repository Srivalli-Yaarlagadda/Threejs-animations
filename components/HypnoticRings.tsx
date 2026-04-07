"use client";

import { useEffect } from "react";
import * as THREE from "three";

export default function HypnoticRings() {
  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 🔥 wider FOV = fills screen more
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      2000
    );

    camera.position.z = 2;

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // FULLSCREEN FIX
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.display = "block";

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    document.body.appendChild(renderer.domElement);

    // 🎯 MORE RINGS (increased density)
    const rings: THREE.Mesh[] = [];

    const geometry = new THREE.RingGeometry(0.8, 1.2, 96);

    const TOTAL_RINGS = 200; // 🔥 increased from 60–70

    for (let i = 0; i < TOTAL_RINGS; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xffffff : 0x000000,
        side: THREE.DoubleSide,
      });

      const ring = new THREE.Mesh(geometry, material);

      // 🔥 spread deeper into space
      ring.position.z = -i * 0.8;

      // 🔥 stronger scaling for screen fill effect
      ring.scale.setScalar(1 + i * 0.03);

      scene.add(ring);
      rings.push(ring);
    }

    // resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 🌀 animation (stronger motion for tunnel effect)
    function animate() {
      requestAnimationFrame(animate);

      rings.forEach((ring) => {
        ring.position.z += 0.08; // 🔥 faster movement

        if (ring.position.z > 5) {
          ring.position.z = -TOTAL_RINGS * 0.8;
        }

        ring.rotation.z += 0.01; // more hypnotic spin
      });

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return null;
}