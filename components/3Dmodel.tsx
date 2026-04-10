// Scene → holds everything
// Camera → sees the scene
// Renderer → draws it
// Lights → make it visible
// Mesh → actual objects
// Controls → user interaction
// Animation → motion

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function Page() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let mixer: THREE.AnimationMixer;          //The animation controller
    let model: THREE.Object3D;                //The loaded 3D model

    const clock = new THREE.Clock();        //Starts a timer internally (performance.now() based

    const init = () => {
      // =========================
      // Scene
      // =========================
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);

      // =========================
      // Camera
      // =========================
      camera = new THREE.PerspectiveCamera(
        60,                                         // fov: field of view in degrees (vertical)
        window.innerWidth / window.innerHeight,     //screen ratio 
        0.1,                                        // near: closest visible 
        100                                         // far: farthest visible
      );
      camera.position.set(0, 1.5, 4);               //natural viewing angle

      // =========================
      // Renderer
      // =========================
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);            //full screen

      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;                  //soft edges

      mountRef.current!.appendChild(renderer.domElement);

      // =========================
      // Controls Drag → rotate Scroll → zoom
      // =========================
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      // =========================
      // Lighting
      // =========================
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));

      const light = new THREE.DirectionalLight(0xffe0b0, 2);           //Main light source (like sun)
      light.position.set(5, 10, 5);
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      scene.add(light);

      // =========================
      // Floor
      // =========================
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),          //flat surface
        new THREE.MeshStandardMaterial({
          color: 0x333333,
          roughness: 1,                          //matte (no shine)
        })
      );
      floor.rotation.x = -Math.PI / 2;            //Rotates it to lie flat
      floor.receiveShadow = true;                 //shadows to appear on floor
      scene.add(floor);

      // =========================
      // Load Cute Model (Parrot 🐦) Runs when model is ready
      // =========================
      const loader = new GLTFLoader();

      loader.load(
        "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Parrot.glb",

        (gltf) => {
          model = gltf.scene;

          model.scale.set(0.02, 0.02, 0.02);         //scale down

          // 🔥 PERFECT GROUND FIX
          const box = new THREE.Box3().setFromObject(model);
          model.position.y -= box.min.y;

          // Shadows castShadow → object creates shadow receiveShadow → object receives shadow
          model.traverse((child: any) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          scene.add(model);

          // Animation
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        },

        undefined,

        (error) => {
          console.error("Error loading model:", error);
        }
      );

      // =========================
      // Animation Loop Runs every frame (~60fps)
      // =========================
      const animate = () => {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        controls.update();
        renderer.render(scene, camera);
      };

      animate();

      // =========================
      // Resize
      // =========================
      window.addEventListener("resize", onResize);
    };

    const onResize = () => {
      if (!camera || !renderer) return;

      const w = window.innerWidth;
      const h = window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    init();

    return () => {
      window.removeEventListener("resize", onResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  return (
    <main
      ref={mountRef}
      className="w-full h-screen flex justify-center items-center"
    />
  );
}