"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { GUI } from "lil-gui";

export default function ThreeGuiScene() {
  useEffect(() => {
    // controls
    const gui = new GUI();

    // sizes
    let width = window.innerWidth;
    let height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z").min(10).max(60).step(10);

    // cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    const cubeColor = {
      color: 0xffffff,
    };

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");

    materialFolder.addColor(cubeColor, "color").onChange(() => {
      material.color.set(cubeColor.color);
    });

    materialFolder.open();

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const cubeFolder = gui.addFolder("Cube");

    // position
    const posFolder = cubeFolder.addFolder("position");
    posFolder.add(cube.position, "x", 0, 5, 0.1);
    posFolder.add(cube.position, "y", 0, 5, 0.1);
    posFolder.add(cube.position, "z", 0, 5, 0.1);
    posFolder.open();

    // scale
    const scaleFolder = cubeFolder.addFolder("Scale");
    scaleFolder.add(cube.scale, "x", 0, 5, 0.1).name("Width");
    scaleFolder.add(cube.scale, "y", 0, 5, 0.1).name("Height");
    scaleFolder.add(cube.scale, "z", 0, 5, 0.1).name("Depth");
    scaleFolder.open();

    cubeFolder.open();

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("threejs-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
    }

    // responsiveness
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", handleResize);

    // animation
    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.005;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
    };
  }, []);

  return <div id="threejs-container" className="w-full h-screen" />;
}