"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function DirectionalLightScene() {
  useEffect(() => {
    // GUI
    const gui = new dat.GUI();

    // sizes
    let width = window.innerWidth;
    let height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z", 10, 80, 1);
    camFolder.open();

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight();
    light.position.set(2.5, 2, 2);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;
    scene.add(light);

    const helper = new THREE.DirectionalLightHelper(light);
    scene.add(helper);

    // light controls
    const lightColor = {
      color: light.color.getHex(),
    };

    const lightFolder = gui.addFolder("Directional Light");
    lightFolder.addColor(lightColor, "color").onChange(() => {
      light.color.set(lightColor.color);
    });
    lightFolder.add(light, "intensity", 0, 1, 0.01);
    lightFolder.open();

    const directionalLightFolder = gui.addFolder("Position of Light");
    directionalLightFolder.add(light.position, "x", -10, 10, 0.1);
    directionalLightFolder.add(light.position, "y", -10, 10, 0.1);
    directionalLightFolder.add(light.position, "z", -10, 10, 0.1);
    directionalLightFolder.open();

    // plane
    const planeGeometry = new THREE.PlaneGeometry(100, 20);
    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    plane.rotateX(-Math.PI / 2);
    plane.position.y = -1.75;
    plane.receiveShadow = true;
    scene.add(plane);

    // cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0.5, 0);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("container");
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

      renderer.setSize(window.innerWidth, window.innerHeight);
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

  return <div id="container" className="w-full h-screen" />;
}