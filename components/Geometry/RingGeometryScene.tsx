"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function RingGeometryScene() {
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

    // ring
    const geometry = new THREE.RingGeometry();
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const ring = new THREE.Mesh(geometry, material);
    scene.add(ring);

    const ringProps = {
      innerRadius: 1,
      outerRadius: 5,
      thetaSegments: 8,
      phiSegments: 8,
      thetaStart: 0,
      thetaLength: 2 * Math.PI,
    };

    const props = gui.addFolder("Properties");

    function redraw() {
      const newGeometry = new THREE.RingGeometry(
        ringProps.innerRadius,
        ringProps.outerRadius,
        ringProps.thetaSegments,
        ringProps.phiSegments,
        ringProps.thetaStart,
        ringProps.thetaLength
      );
      ring.geometry.dispose();
      ring.geometry = newGeometry;
    }

    props
      .add(ringProps, "innerRadius", 1, 50)
      .step(1)
      .onChange(redraw)
      .onFinishChange(() => console.dir(ring.geometry));

    props.add(ringProps, "outerRadius", 1, 50).step(1).onChange(redraw);
    props.add(ringProps, "thetaSegments", 1, 50).step(1).onChange(redraw);
    props.add(ringProps, "phiSegments", 1, 50).step(1).onChange(redraw);
    props.add(ringProps, "thetaStart", 0, 2 * Math.PI).onChange(redraw);
    props.add(ringProps, "thetaLength", 0, 2 * Math.PI).onChange(redraw);

    props.open();

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("ring-container");
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

      ring.rotation.x += 0.005;
      ring.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
    };
  }, []);

  return <div id="ring-container" className="w-full h-screen" />;
}