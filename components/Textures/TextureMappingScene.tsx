"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const TEX_BASE =
  "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/5basecolor.jpg";
const TEX_NORMAL =
  "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/2normal.jpg";
const TEX_HEIGHT =
  "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/0height.png";
const TEX_ROUGH =
  "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/3roughness.jpg";
const TEX_AO =
  "https://cloud-nfpbfxp6x-hackclub-bot.vercel.app/4ambientocclusion.jpg";
const TEX_METAL =
  "https://cloud-nfpbfxp6x-hack-clubbot.vercel.app/1metallic.jpg";

export default function TextureMappingScene() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 4.0);
    light.position.set(0, 10, 20);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;
    scene.add(light);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const texture = loader.load(TEX_BASE);
    const normalmap = loader.load(TEX_NORMAL);
    const heightmap = loader.load(TEX_HEIGHT);
    const roughmap = loader.load(TEX_ROUGH);
    const ambientOcclusionmap = loader.load(TEX_AO);
    const metallicmap = loader.load(TEX_METAL);

    // Only the albedo (map) is sRGB. Normal / roughness / metal / AO / displacement are linear data;
    // marking them sRGB breaks PBR sampling and often yields all-black spheres in r152+.
    texture.colorSpace = THREE.SRGBColorSpace;
    for (const t of [
      normalmap,
      heightmap,
      roughmap,
      ambientOcclusionmap,
      metallicmap,
    ]) {
      t.colorSpace = THREE.LinearSRGBColorSpace;
    }

    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const plane = new THREE.Mesh(
      planeGeometry,
      new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    plane.rotateX(-Math.PI / 2);
    plane.position.y = -2.75;
    plane.receiveShadow = true;
    scene.add(plane);

    const geometry = new THREE.SphereGeometry(1, 64, 64);

    const material1 = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const object1 = new THREE.Mesh(geometry, material1);
    object1.position.set(-2.5, 1.5, 0);
    object1.castShadow = true;
    scene.add(object1);

    const material2 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      normalMap: normalmap,
    });
    const object2 = new THREE.Mesh(geometry, material2);
    object2.position.set(0, 1.5, 0);
    object2.castShadow = true;
    scene.add(object2);

    const material3 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      normalMap: normalmap,
      displacementMap: heightmap,
      displacementScale: 0.05,
    });
    const object3 = new THREE.Mesh(geometry, material3);
    object3.position.set(2.5, 1.5, 0);
    object3.castShadow = true;
    scene.add(object3);

    const material4 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      normalMap: normalmap,
      displacementMap: heightmap,
      displacementScale: 0.05,
      roughnessMap: roughmap,
      roughness: 0.5,
    });
    const object4 = new THREE.Mesh(geometry, material4);
    object4.position.set(-2.5, -1.5, 0);
    object4.castShadow = true;
    scene.add(object4);

    const material5 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      normalMap: normalmap,
      displacementMap: heightmap,
      displacementScale: 0.05,
      roughnessMap: roughmap,
      roughness: 0.1,
      aoMap: ambientOcclusionmap,
    });
    const object5 = new THREE.Mesh(geometry, material5);
    object5.position.set(0, -1.5, 0);
    object5.geometry.setAttribute(
      "uv2",
      object5.geometry.attributes.uv!
    );
    object5.castShadow = true;
    scene.add(object5);

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, {
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
    });
    cubeRenderTarget.texture.colorSpace = THREE.SRGBColorSpace;

    const cubeCamera = new THREE.CubeCamera(1, 10000, cubeRenderTarget);
    cubeCamera.position.set(0, 100, 0);
    scene.add(cubeCamera);

    const material6 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide,
      normalMap: normalmap,
      displacementMap: heightmap,
      displacementScale: 0.15,
      roughnessMap: roughmap,
      roughness: 0.1,
      aoMap: ambientOcclusionmap,
      metalnessMap: metallicmap,
      metalness: 1,
      envMap: cubeRenderTarget.texture,
      envMapIntensity: 1.25,
    });
    const object6 = new THREE.Mesh(geometry, material6);
    object6.position.set(2.5, -1.5, 0);
    object6.geometry.setAttribute(
      "uv2",
      object6.geometry.attributes.uv!
    );
    object6.castShadow = true;
    scene.add(object6);

    cubeCamera.position.copy(object6.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    const objects = [object1, object2, object3, object4, object5, object6];

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    };

    window.addEventListener("resize", onResize);

    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      objects.forEach((obj) => {
        obj.rotation.y += 0.01;
      });
      controls.update();
      cubeCamera.update(renderer, scene);
      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeometry.dispose();
      (plane.material as THREE.MeshPhongMaterial).dispose();
      geometry.dispose();
      [material1, material2, material3, material4, material5, material6].forEach(
        (m) => m.dispose()
      );
      [
        texture,
        normalmap,
        heightmap,
        roughmap,
        ambientOcclusionmap,
        metallicmap,
      ].forEach((t) => t.dispose());
      cubeRenderTarget.dispose();
    };
  }, []);

  return (
    <div className="box-border flex min-h-dvh min-h-screen w-screen flex-col font-sans antialiased">
      <h1 className="sr-only">Three.js — Texture Mapping</h1>
      <div
        ref={containerRef}
        className="h-dvh h-screen w-full flex-1 [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
      />
    </div>
  );
}
