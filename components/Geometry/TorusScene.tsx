"use client";

import { useEffect } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";

export default function TorusScene() {
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
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z").min(10).max(60).step(10);
    camFolder.open();

    // torus
    const geometry = new THREE.TorusGeometry();

    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    const materialFolder = gui.addFolder("Material");
    materialFolder.add(material, "wireframe");
    materialFolder.open();

    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const torusProps = {
      radius: 1,
      tubeRadius: 0.5,
      radialSegments: 8,
      tubularSegments: 6,
      arc: 2 * Math.PI,
    };

    const props = gui.addFolder("Properties");

    props
      .add(torusProps, "radius", 1, 50)
      .step(1)
      .onChange(redraw)
      .onFinishChange(() => console.dir(torus.geometry));

    props.add(torusProps, "tubeRadius", 0.1, 50).step(0.1).onChange(redraw);
    props.add(torusProps, "radialSegments", 1, 50).step(1).onChange(redraw);
    props.add(torusProps, "tubularSegments", 1, 50).step(1).onChange(redraw);
    props.add(torusProps, "arc", 0, 2 * Math.PI).onChange(redraw);

    props.open();

    function redraw() {
      const newGeometry = new THREE.TorusGeometry(
        torusProps.radius,
        torusProps.tubeRadius,
        torusProps.radialSegments,
        torusProps.tubularSegments,
        torusProps.arc
      );

      torus.geometry.dispose();
      torus.geometry = newGeometry;
    }

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = document.getElementById("threejs-container");
    container?.appendChild(renderer.domElement);

    // resize
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

      torus.rotation.x += 0.005;
      torus.rotation.y += 0.01;

      renderer.render(scene, camera);
    }

    renderer.render(scene, camera);
    animate();

    // cleanup (important in Next.js)
    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <div id="threejs-container" className="w-full h-full" />
    </div>
  );
}