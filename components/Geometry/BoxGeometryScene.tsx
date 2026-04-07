"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function BoxGeometryScene() {
  useEffect(() => {
    const gui = new dat.GUI();

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // camera
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z").min(10).max(60).step(10);
    camFolder.open();

    // cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      wireframe: true,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    console.log(cube);

    const cubeProps = {
      width: 1,
      height: 1,
      depth: 1,
      widthSegments: 1,
      heightSegments: 1,
      depthSegments: 1,
    };

    const props = gui.addFolder("Properties");

    function redraw() {
      const newGeometry = new THREE.BoxGeometry(
        cubeProps.width,
        cubeProps.height,
        cubeProps.depth,
        cubeProps.widthSegments,
        cubeProps.heightSegments,
        cubeProps.depthSegments
      );
      cube.geometry.dispose();
      cube.geometry = newGeometry;
    }

    props
      .add(cubeProps, "width", 1, 30)
      .step(1)
      .onChange(redraw)
      .onFinishChange(() => console.dir(cube.geometry));

    props.add(cubeProps, "height", 1, 30).step(1).onChange(redraw);
    props.add(cubeProps, "depth", 1, 30).step(1).onChange(redraw);
    props.add(cubeProps, "widthSegments", 1, 30).step(1).onChange(redraw);
    props.add(cubeProps, "heightSegments", 1, 30).step(1).onChange(redraw);
    props.add(cubeProps, "depthSegments", 1, 30).step(1).onChange(redraw);

    props.open();

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("box-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(renderer.domElement);
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

    // animation
    const animate = () => {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.005;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
    };
  }, []);

  return <div id="box-container" className="w-full h-screen" />;
}