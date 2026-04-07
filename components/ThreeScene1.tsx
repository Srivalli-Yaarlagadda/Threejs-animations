"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  onAddRef: React.MutableRefObject<(() => void) | null>;
  onRemoveRef: React.MutableRefObject<(() => void) | null>;
};

export default function ThreeScene1({ onAddRef, onRemoveRef }: Props) {
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);
    sceneRef.current = scene;

   
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light = new THREE.PointLight(0xffffff, 0.5);
    light.position.set(-10, 10, -10);
    light.castShadow = true;
    scene.add(light);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 40);

    // Plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.75;
    plane.receiveShadow = true;
    scene.add(plane);

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("threejs-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    }

    // ✅ ADD CUBE
    const addCube = () => {
      if (!sceneRef.current) return;

      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(
          Math.ceil(Math.random() * 3),
          Math.ceil(Math.random() * 3),
          Math.ceil(Math.random() * 3)
        ),
        new THREE.MeshLambertMaterial({
          color: Math.random() * 0xffffff,
        })
      );

      cube.name = "cube";

      cube.position.set(
        -30 + Math.random() * 50,
        Math.random() * 5,
        -20 + Math.random() * 50
      );

      sceneRef.current.add(cube);

      const cubes = sceneRef.current.children.filter(
        (obj) => obj.name === "cube"
      );

      console.log("cube added");
      console.log(cubes); // starts from (1)
    };

    // ✅ REMOVE CUBE
    const removeCube = () => {
      if (!sceneRef.current) return;

      const cubes = sceneRef.current.children.filter(
        (obj) => obj.name === "cube"
      );

      if (cubes.length > 0) {
        sceneRef.current.remove(cubes[cubes.length - 1]);

        const updated = sceneRef.current.children.filter(
          (obj) => obj.name === "cube"
        );

        console.log("cube removed");
        console.log(updated);
      }
    };

    // ✅ expose functions to parent
    onAddRef.current = addCube;
    onRemoveRef.current = removeCube;

    // Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div id="threejs-container" className="w-full h-full" />;
}