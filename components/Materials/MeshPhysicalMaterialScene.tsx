// "use client";

// import { GUI } from "lil-gui";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// export default function MeshPhysicalMaterialScene() {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const gui = new GUI();

//     let width = window.innerWidth;
//     let height = window.innerHeight;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x262626);

//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambientLight);

//     const light = new THREE.PointLight();
//     light.position.set(0, 10, 10);
//     light.castShadow = true;
//     scene.add(light);

//     const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
//     camera.position.set(0, 0, 10);

//     const geometry = new THREE.TorusKnotGeometry(0.7, 0.28, 128, 64, 2, 3);

//     const materials = [
//       new THREE.MeshLambertMaterial({ color: 0x87ceeb }),
//       new THREE.MeshPhongMaterial({ color: 0x87ceeb }),
//       new THREE.MeshStandardMaterial({ color: 0x87ceeb }),
//       new THREE.MeshPhysicalMaterial({ color: 0x87ceeb }),
//     ];

//     const meshes = materials.map(
//       (mat, i) => new THREE.Mesh(geometry, mat)
//     );

//     meshes.forEach((mesh, i) => {
//       mesh.position.x = -6 + i * 3;
//       scene.add(mesh);
//     });

//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     const controls = new OrbitControls(camera, renderer.domElement);

//     if (containerRef.current) {
//       containerRef.current.appendChild(renderer.domElement);
//     }

//     const handleResize = () => {
//       width = window.innerWidth;
//       height = window.innerHeight;

//       camera.aspect = width / height;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height);
//     };

//     window.addEventListener("resize", handleResize);

//     function animate() {
//       requestAnimationFrame(animate);

//       meshes.forEach((m) => {
//         m.rotation.x += 0.005;
//         m.rotation.y += 0.01;
//       });

//       controls.update();
//       renderer.render(scene, camera);
//     }

//     animate();

//     return () => {
//       window.removeEventListener("resize", handleResize);
//       gui.destroy();
//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={containerRef} className="w-screen h-screen" />;
// }
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function MeshPhysicalMaterialScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // ---------------- SCENE ----------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x262626);

    // ---------------- CAMERA ----------------
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    // ---------------- RENDERER ----------------
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ✅ IMPORTANT: allow inspect
    renderer.domElement.style.pointerEvents = "none";

    container.appendChild(renderer.domElement);

    // ---------------- LIGHTS ----------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // ---------------- OBJECTS ----------------
    const geometry = new THREE.TorusKnotGeometry(0.7, 0.28, 128, 64);

    const materials = [
      new THREE.MeshLambertMaterial({ color: 0x87ceeb }),
      new THREE.MeshPhongMaterial({ color: 0x87ceeb }),
      new THREE.MeshStandardMaterial({ color: 0x87ceeb }),
      new THREE.MeshPhysicalMaterial({ color: 0x87ceeb }),
    ];

    const meshes = materials.map((mat) => new THREE.Mesh(geometry, mat));
    meshes.forEach((m) => scene.add(m));

    // ---------------- RESPONSIVE LAYOUT ----------------
    const setLayout = () => {
      const isMobile = width < 640;
      const isTablet = width < 1240;

      meshes.forEach((mesh, i) => {
        if (isMobile) {
          // ✅ vertical stack (fixed spacing + depth)
          mesh.position.set(0, 3 - i * 2.8, -i * 0.6);
          mesh.scale.set(0.8, 0.8, 0.8);
        } else if (isTablet) {
          // ✅ 2x2 grid
          const col = i % 2;
          const row = Math.floor(i / 2);

          mesh.position.set(col * 4 - 2, 2 - row * 4, 0);
          mesh.scale.set(1, 1, 1);
        } else {
          // ✅ horizontal row
          mesh.position.set(-6 + i * 4, 0, 0);
          mesh.scale.set(1, 1, 1);
        }
      });
    };

    setLayout();

    // ❌ disable controls (so inspect works)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    // ---------------- RESIZE ----------------
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;

      // ✅ responsive camera
      if (width < 640) {
        camera.position.set(0, 0, 18);
      } else if (width < 1024) {
        camera.position.set(0, 0, 14);
      } else {
        camera.position.set(0, 0, 10);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      setLayout();
    };

    window.addEventListener("resize", handleResize);

    // ---------------- ANIMATION ----------------
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      meshes.forEach((m) => {
        m.rotation.x += 0.005;
        m.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    // ---------------- CLEANUP ----------------
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}