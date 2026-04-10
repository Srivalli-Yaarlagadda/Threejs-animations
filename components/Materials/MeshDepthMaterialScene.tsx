// "use client";

// import { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { GUI } from "lil-gui";

// export default function MeshDepthMaterialScene() {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     const gui = new GUI(); //Creates a control panel on screen Used to interactively change properties

//     // Renderer size
//     let width = window.innerWidth;
//     let height = window.innerHeight;

//     //Creates a 3D world Background = dark gray
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x262626);

//     // Normally lights affect materials like Lambert/Phong/Standard 
//     // //BUT ⚠️ MeshDepthMaterial ignores lights So here lights are not actually affecting the mesh, but still included
//     const ambientLight = new THREE.AmbientLight(0xffffff, 1);
//     scene.add(ambientLight);

//     const pointLight = new THREE.PointLight(0xffffff, 0.5);
//     pointLight.position.set(2, 3, 4);
//     scene.add(pointLight);

//     //MeshDepthMaterial calculates: distance from camera → mapped between near & far
//     const camera = new THREE.PerspectiveCamera(30, width / height, 250, 550);
//     camera.position.z = 450;

//     //Creates a complex 3D knot shape
//     const geometry = new THREE.TorusKnotGeometry(50, 20, 128, 64, 2, 3);

//     //Uses distance from camera → grayscale Near → White Far → Black
//     const material = new THREE.MeshDepthMaterial();

//     // switches from Normal surface to Wireframe mode
//     const folder = gui.addFolder("Material");
//     folder.add(material, "wireframe");
//     folder.open();

//     //Combines: Geometry (shape) Material (depth-based color)
//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);

//     //Better depth precision
//     const renderer = new THREE.WebGLRenderer({
//       logarithmicDepthBuffer: true,
//     });

//     //Makes it sharp on retina screens
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     if (containerRef.current) {
//       // Adds <canvas> inside your div Now the scene becomes visible
//       containerRef.current.appendChild(renderer.domElement);
//     }

//     // Responsiveness
//     const handleResize = () => {
//       width = window.innerWidth;
//       height = window.innerHeight;

//       camera.aspect = width / height;
//       camera.updateProjectionMatrix();

//       renderer.setSize(width, height);
//     };

//     window.addEventListener("resize", handleResize);

//     //Animation Loop
//     function animate() {
//       requestAnimationFrame(animate);
//       mesh.rotation.x += 0.005;
//       mesh.rotation.y += 0.01;
//       renderer.render(scene, camera);
//     }

//     animate();

//     //Destroys GUI ,Frees GPU memory
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       gui.destroy();
//       renderer.dispose();
//     };
//   }, []);

//   return <div ref={containerRef} className="w-screen h-screen" />; //A full-screen container is rendered Still empty at this point
// }

// with responsiveness
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from "lil-gui";

export default function MeshDepthMaterialScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const gui = new GUI();

    // ✅ Container size (NOT window)Uses actual container size Fixes mobile issues
    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Lights (not used by depth material, but kept)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    // ✅ Camera (fixed)
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);

    // Geometry
    const geometry = new THREE.TorusKnotGeometry(50, 20, 128, 64, 2, 3);

    // Material
    const material = new THREE.MeshDepthMaterial();

    const folder = gui.addFolder("Material");
    folder.add(material, "wireframe");
    folder.open();

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ✅ FORCE CANVAS FULL SIZE
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    containerRef.current.appendChild(renderer.domElement);

    // ✅ PERFECT CENTER FIT (NO LEFT SHIFT) Fit Object to Center
    const fitObjectToView = () => {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)); //Field of View (FOV) FOV is the part of the scene that is visible on display at any given moment.

      cameraZ *= 0.7; // adjust zoom

      camera.position.set(center.x, center.y, cameraZ);
      camera.lookAt(center);
    };

    // ✅ RESPONSIVE SCALE (Smaller on mobile ,Normal on desktop)
    const updateScale = () => {
      const scale = Math.min(width / 600, 1);
      mesh.scale.set(scale, scale, scale);
    };

    fitObjectToView();
    updateScale();

    // ✅ RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current) return;

      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      updateScale();
      fitObjectToView();
    };

    window.addEventListener("resize", handleResize);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
      mesh.rotation.z += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      gui.destroy();
      renderer.dispose();

      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-[100dvh] flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}