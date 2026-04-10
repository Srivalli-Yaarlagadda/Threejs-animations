"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Scene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // softer shadows

    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 0.8; // 🔥 reduced exposure

    container.appendChild(renderer.domElement);

    // Texture loader
    const loader = new THREE.TextureLoader();

    // FLOOR
    const wood = loader.load(
      "https://threejs.org/examples/textures/hardwood2_diffuse.jpg"
    );
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
    wood.repeat.set(8, 8);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({
        map: wood,
        roughness: 0.8,
        metalness: 0.1,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // CUBE
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({
        color: 0xaa7744,
        roughness: 0.7,
      })
    );
    cube.position.set(-2, 0.5, 0);
    cube.castShadow = true;
    scene.add(cube);

    // GLOBE
    const earth = loader.load(
      "https://threejs.org/examples/textures/earth_atmos_2048.jpg"
    );

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 64, 64),
      new THREE.MeshStandardMaterial({
        map: earth,
        roughness: 0.9,
      })
    );
    globe.position.set(2, 0.7, 0);
    globe.castShadow = true;
    scene.add(globe);

    // 🔥 LIGHT (FIXED)
    const light = new THREE.PointLight(
      0xffcc88, // warm color 🔥
      80,       // reduced intensity
      15,
      2
    );
    light.castShadow = true;

    light.shadow.mapSize.set(1024, 1024);
    scene.add(light);

    // small visible light
    const lightMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffcc88 })
    );
    scene.add(lightMesh);

    // VERY LOW ambient
    scene.add(new THREE.AmbientLight(0xffffff, 0.02));

    // Animation
    let t = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      t += 0.02;

      const y = 2 + Math.sin(t) * 1.5;

      light.position.set(0, y, 0);
      lightMesh.position.copy(light.position);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}