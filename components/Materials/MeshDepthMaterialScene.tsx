"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from "lil-gui";

export default function MeshDepthMaterialScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gui = new GUI();

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const camera = new THREE.PerspectiveCamera(30, width / height, 250, 550);
    camera.position.z = 450;

    const geometry = new THREE.TorusKnotGeometry(50, 20, 128, 64, 2, 3);
    const material = new THREE.MeshDepthMaterial();

    const folder = gui.addFolder("Material");
    folder.add(material, "wireframe");
    folder.open();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
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