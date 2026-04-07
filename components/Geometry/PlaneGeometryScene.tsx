"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function PlaneGeometryScene() {
  useEffect(() => {
    const gui = new dat.GUI();

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z").min(10).max(60).step(10);
    camFolder.open();

    // lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // plane
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // props
    const planeProps = {
      width: 1,
      height: 1,
      widthSegments: 1,
      heightSegments: 1,
    };

    const props = gui.addFolder("Properties");

    function redraw() {
      const newGeometry = new THREE.PlaneGeometry(
        planeProps.width,
        planeProps.height,
        planeProps.widthSegments,
        planeProps.heightSegments
      );
      plane.geometry.dispose();
      plane.geometry = newGeometry;
    }

    props
      .add(planeProps, "width", 1, 30)
      .step(1)
      .onChange(redraw)
      .onFinishChange(() => console.dir(plane.geometry));

    props.add(planeProps, "height", 1, 30).step(1).onChange(redraw);
    props.add(planeProps, "widthSegments", 1, 30).step(1).onChange(redraw);
    props.add(planeProps, "heightSegments", 1, 30).step(1).onChange(redraw);

    props.open();

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("plane-container");
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

      plane.rotation.x += 0.005;
      plane.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
    };
  }, []);

  return <div id="plane-container" className="w-full h-screen" />;
}