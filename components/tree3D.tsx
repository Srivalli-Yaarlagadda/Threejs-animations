// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// export default function TreeScene() {
//   const mountRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!mountRef.current) return;

//     // 🌌 Scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0xaadfff);

//     // 📷 Camera
//     const camera = new THREE.PerspectiveCamera(
//       60,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(4, 2, 6);

//     // 🖥️ Renderer
//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.shadowMap.enabled = true;

//     mountRef.current.appendChild(renderer.domElement);

//     // 💡 Lights
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//     scene.add(ambientLight);

//     const dirLight = new THREE.DirectionalLight(0xffffff, 1);
//     dirLight.position.set(5, 10, 5);
//     dirLight.castShadow = true;
//     scene.add(dirLight);

//     // 🌍 Ground
//     const ground = new THREE.Mesh(
//       new THREE.PlaneGeometry(30, 30),
//       new THREE.MeshStandardMaterial({ color: 0x88cc88 })
//     );
//     ground.rotation.x = -Math.PI / 2;
//     ground.receiveShadow = true;
//     scene.add(ground);

//     // 🌳 Load GLTF (YOUR PATH)
//     const loader = new GLTFLoader();

//     loader.load(
//       "/tree_small_02_4k.gltf/tree_small_02_4k.gltf",
//       (gltf) => {
//         const tree = gltf.scene;

//         // 📏 Adjust size if needed
//         tree.scale.set(1, 1, 1);

//         // 📍 Position fix
//         tree.position.set(0, 0, 0);

//         // 🌑 Enable shadows
//         tree.traverse((child: any) => {
//           if (child.isMesh) {
//             child.castShadow = true;
//             child.receiveShadow = true;
//           }
//         });

//         scene.add(tree);
//       },
//       undefined,
//       (error) => {
//         console.error("Error loading model:", error);
//       }
//     );

//     // 🎮 Controls
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;

//     // 🔄 Animation
//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       renderer.render(scene, camera);
//     };
//     animate();

//     // 📱 Resize
//     const handleResize = () => {
//       const width = window.innerWidth;
//       const height = window.innerHeight;

//       camera.aspect = width / height;
//       camera.updateProjectionMatrix();
//       renderer.setSize(width, height);
//     };

//     window.addEventListener("resize", handleResize);

//     // 🧹 Cleanup
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       mountRef.current?.removeChild(renderer.domElement);
//     };
//   }, []);

//   return <div ref={mountRef} className="w-full h-screen" />;
// }


"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function TreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 🌌 Scene (WHITE BG)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // 📷 Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 6);

    // 🖥️ Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    mountRef.current.appendChild(renderer.domElement);

    // 💡 Lights (soft clean lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 🌳 Load Model
    const loader = new GLTFLoader();

    loader.load(
      "/tree_small_02_4k.gltf/tree_small_02_4k.gltf",
      (gltf) => {
        const tree = gltf.scene;

        // 📦 Center the model properly
        const box = new THREE.Box3().setFromObject(tree);
        const center = box.getCenter(new THREE.Vector3());
        tree.position.sub(center);

        // 📏 Adjust size
        tree.scale.set(1.5, 1.5, 1.5);

        // 🌑 Shadows (optional but safe)
        tree.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(tree);

        // 🎯 Focus camera to center
        controls.target.set(0, 0.5, 0);
        controls.update();
      }
    );

    // 🎮 Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 🔄 Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 📱 Resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen" />;
}