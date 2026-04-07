"use client";

import { GUI } from "lil-gui";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function MeshPhysicalMaterialScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gui = new GUI();

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light = new THREE.PointLight();
    light.position.set(0, 10, 10);
    light.castShadow = true;
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const geometry = new THREE.TorusKnotGeometry(0.7, 0.28, 128, 64, 2, 3);

    const materials = [
      new THREE.MeshLambertMaterial({ color: 0x87ceeb }),
      new THREE.MeshPhongMaterial({ color: 0x87ceeb }),
      new THREE.MeshStandardMaterial({ color: 0x87ceeb }),
      new THREE.MeshPhysicalMaterial({ color: 0x87ceeb }),
    ];

    const meshes = materials.map(
      (mat, i) => new THREE.Mesh(geometry, mat)
    );

    meshes.forEach((mesh, i) => {
      mesh.position.x = -6 + i * 3;
      scene.add(mesh);
    });

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    function animate() {
      requestAnimationFrame(animate);

      meshes.forEach((m) => {
        m.rotation.x += 0.005;
        m.rotation.y += 0.01;
      });

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-screen h-screen" />;
}