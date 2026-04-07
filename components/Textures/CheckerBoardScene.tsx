"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from "lil-gui";
export default function CheckerBoardScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const gui = new GUI();

    let width = window.innerWidth;
    let height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "z", 10, 60, 10);
    camFolder.open();

    // light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // texture
    const planeSize = 10;

    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/0height.png"
    );

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;

    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    // helper class (EXACT SAME LOGIC)
    class StringToNumberHelper {
      obj: any;
      prop: string;

      constructor(obj: any, prop: string) {
        this.obj = obj;
        this.prop = prop;
      }

      get value() {
        return this.obj[this.prop];
      }

      set value(v: any) {
        this.obj[this.prop] = parseFloat(v);
      }
    }

    const wrapModes: any = {
      ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
      RepeatWrapping: THREE.RepeatWrapping,
      MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
    };

    function updateTexture() {
      texture.needsUpdate = true;
    }

    gui
      .add(new StringToNumberHelper(texture, "wrapS"), "value", wrapModes)
      .name("texture.wrapS")
      .onChange(updateTexture);

    gui
      .add(new StringToNumberHelper(texture, "wrapT"), "value", wrapModes)
      .name("texture.wrapT")
      .onChange(updateTexture);

    gui.add(texture.repeat, "x", 0, 5, 0.01).name("texture.repeat.x");
    gui.add(texture.repeat, "y", 0, 5, 0.01).name("texture.repeat.y");

    // plane
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const board = new THREE.Mesh(geometry, material);
    board.position.set(0, 0, 0);
    scene.add(board);

    // renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

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

    // animate
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <div id="threejs-container" ref={containerRef} className="w-full h-full" />
    </div>
  );
}