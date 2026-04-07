"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function TorusKnotScene() {
  useEffect(() => {
    const gui = new dat.GUI();

    // sizes (same as original)
    let width = window.innerWidth;
    let height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // camera
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z").min(10).max(60).step(10);
    camFolder.open();

    // torus knot
    const geometry = new THREE.TorusKnotGeometry();

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const torusKnotProps = {
      radius: 1,
      tubeRadius: 0.5,
      radialSegments: 64,
      tubularSegments: 8,
      p: 2,
      q: 3,
    };

    const props = gui.addFolder("Properties");

    props.add(torusKnotProps, "radius", 1, 50).step(1).onChange(redraw);
    props.add(torusKnotProps, "tubeRadius", 0.1, 50).step(0.1).onChange(redraw);
    props.add(torusKnotProps, "radialSegments", 1, 50).step(1).onChange(redraw);
    props.add(torusKnotProps, "tubularSegments", 1, 50).step(1).onChange(redraw);
    props.add(torusKnotProps, "p", 1, 20).step(1).onChange(redraw);
    props.add(torusKnotProps, "q", 1, 20).step(1).onChange(redraw);

    props.open();

    function redraw() {
      const newGeometry = new THREE.TorusKnotGeometry(
        torusKnotProps.radius,
        torusKnotProps.tubeRadius,
        torusKnotProps.radialSegments,
        torusKnotProps.tubularSegments,
        torusKnotProps.p,
        torusKnotProps.q
      );

      torusKnot.geometry.dispose();
      torusKnot.geometry = newGeometry;
    }

    // renderer
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("threejs-container");
    container?.appendChild(renderer.domElement);

    // resize (FIXED original typo: window.innerHlet)
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
    function animate() {
      requestAnimationFrame(animate);

      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    renderer.render(scene, camera);
    animate();

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-[100vw] h-[100vh]">
      <div id="threejs-container" className="w-[100%] h-[100%]" />
    </div>
  );
}