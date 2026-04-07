"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function createStoneNoiseTexture(size = 128) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n =
        (Math.sin(x * 0.42) * Math.cos(y * 0.36) +
          Math.sin(x * 0.09 + y * 0.11) * 0.4 +
          1) *
        0.5;
      const grain = (Math.random() - 0.5) * 22;
      const v = Math.floor(38 + n * 110 + grain);
      data[i] = data[i + 1] = data[i + 2] = clamp01(v / 255) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Top half of an ellipse in XY (y up): t=0 left springing, t=1 right springing,
 * t=0.5 crown — matches Shape.absellipse(..., 0, PI, false).
 */
class EllipticalArchCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly cx: number,
    private readonly cy: number,
    private readonly rx: number,
    private readonly ry: number
  ) {
    super();
  }

  override getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const a = Math.PI * (1 - t);
    return optionalTarget.set(
      this.cx + this.rx * Math.cos(a),
      this.cy + this.ry * Math.sin(a),
      0
    );
  }
}

/** Filled “door of light” silhouette: jambs + smooth convex (tall) arch on top. */
function createArchPortalShape(
  halfWidth: number,
  springY: number,
  sillY: number,
  archRx: number,
  archRy: number
) {
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth, sillY);
  shape.lineTo(halfWidth, sillY);
  shape.lineTo(halfWidth, springY);
  // false = counter‑clockwise → upper arc (convex). true wrongly traces the lower arc (concave “bite”).
  shape.absellipse(0, springY, archRx, archRy, 0, Math.PI, false, 0);
  shape.lineTo(-halfWidth, springY);
  shape.lineTo(-halfWidth, sillY);
  return shape;
}

function mirrorBufferGeometryAcrossY(
  source: THREE.BufferGeometry,
  planeY: number
) {
  const geo = source.clone();
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, 2 * planeY - pos.getY(i));
  }
  pos.needsUpdate = true;
  const idx = geo.index;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i);
      const b = idx.getX(i + 1);
      const c = idx.getX(i + 2);
      idx.setX(i, a);
      idx.setX(i + 1, c);
      idx.setX(i + 2, b);
    }
    idx.needsUpdate = true;
  }
  geo.computeVertexNormals();
  return geo;
}

export default function ScrollDoorThreeScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const heroUiRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let raf = 0;
    let disposed = false;

    const scene = new THREE.Scene();
    const sceneBg = new THREE.Color(0x000000);
    scene.background = sceneBg;
    const blackBg = new THREE.Color(0x000000);
    const whiteBg = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      120
    );
    camera.position.set(0, 0.12, 5.35);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const bumpTex = createStoneNoiseTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.97,
      metalness: 0.06,
      bumpMap: bumpTex,
      bumpScale: 0.095,
    });

    const springY = 0.95;
    const sillY = -0.88;
    const archRx = 0.86;
    const archRy = 0.58;
    const halfW = archRx;
    const pillarCy = (springY + sillY) * 0.5;

    const pillarGeo = new THREE.BoxGeometry(0.26, springY - sillY, 0.36);
    const leftPillar = new THREE.Mesh(pillarGeo, stoneMat);
    leftPillar.position.set(-archRx, pillarCy, 0.04);
    const rightPillar = new THREE.Mesh(pillarGeo, stoneMat);
    rightPillar.position.set(archRx, pillarCy, 0.04);

    const archPath = new EllipticalArchCurve(0, springY, archRx, archRy);
    const archTubeGeo = new THREE.TubeGeometry(archPath, 112, 0.15, 12, false);
    const archMesh = new THREE.Mesh(archTubeGeo, stoneMat);

    const doorPivot = new THREE.Group();
    doorPivot.add(leftPillar, rightPillar, archMesh);

    const portalShape = createArchPortalShape(halfW, springY, sillY, archRx, archRy);
    const portalGlowGeo = new THREE.ShapeGeometry(portalShape, 48);
    portalGlowGeo.computeVertexNormals();
    const portalGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const portalGlow = new THREE.Mesh(portalGlowGeo, portalGlowMat);
    portalGlow.position.z = -0.24;
    doorPivot.add(portalGlow);

    const floorY = sillY - 0.12;
    const thresholdGeo = new THREE.BoxGeometry(4.6, 0.016, 0.055);
    const thresholdMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const threshold = new THREE.Mesh(thresholdGeo, thresholdMat);
    threshold.position.set(0, floorY + 0.012, 0.85);
    scene.add(threshold);

    const portalLight = new THREE.PointLight(0xffffff, 4.2, 22, 1.5);
    portalLight.position.set(0, 0.35, -1.1);
    doorPivot.add(portalLight);

    const spill = new THREE.SpotLight(0xf2f6ff, 2.2, 28, 0.65, 0.35, 0);
    spill.position.set(0, 0.85, -0.75);
    spill.target.position.set(0, sillY - 0.1, 2);
    doorPivot.add(spill);
    doorPivot.add(spill.target);

    scene.add(doorPivot);

    const floorGeo = new THREE.PlaneGeometry(56, 56);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x060608,
      roughness: 1,
      metalness: 0,
    });
    const floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = floorY;
    scene.add(floorPlane);

    const reflectGeo = mirrorBufferGeometryAcrossY(portalGlowGeo, floorY);
    const reflectMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x7a8aa4) },
        uFadeLo: { value: floorY - 2.85 },
        uFadeHi: { value: floorY - 0.02 },
      },
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uFadeLo;
        uniform float uFadeHi;
        varying vec3 vWorldPos;
        void main() {
          float t = smoothstep(uFadeLo, uFadeHi, vWorldPos.y);
          if (t < 0.008) discard;
          float shade = 0.28 + 0.52 * t;
          float a = t * 0.38;
          gl_FragColor = vec4(uColor * shade, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const portalReflect = new THREE.Mesh(reflectGeo, reflectMat);
    portalReflect.position.z = -0.24;
    doorPivot.add(portalReflect);

    const innerGroup = new THREE.Group();
    innerGroup.position.set(0, 0, -42);
    innerGroup.visible = false;

    const backGeo = new THREE.PlaneGeometry(80, 56);
    const backMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const backWall = new THREE.Mesh(backGeo, backMat);
    backWall.position.z = -8;
    innerGroup.add(backWall);

    const ambient = new THREE.AmbientLight(0x1a1a22, 0.2);
    scene.add(ambient);
    const fill = new THREE.DirectionalLight(0xb8c4e8, 0.35);
    fill.position.set(-4, 8, 6);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x4466aa, 0.22);
    rim.position.set(5, 2, -4);
    scene.add(rim);

    scene.add(innerGroup);

    let targetScroll = window.scrollY;
    let smoothScroll = window.scrollY;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const onScroll = () => {
      targetScroll = window.scrollY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      pointerTarget.x = (e.clientX / w) * 2 - 1;
      pointerTarget.y = -(e.clientY / h) * 2 + 1;
    };

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);

      smoothScroll += (targetScroll - smoothScroll) * 0.09;
      pointer.x += (pointerTarget.x - pointer.x) * 0.08;
      pointer.y += (pointerTarget.y - pointer.y) * 0.08;

      const sectionPx = window.innerHeight * 2.35;
      const rawP = clamp01(smoothScroll / sectionPx);
      const p = easeInOutCubic(rawP);

      const maxTiltY = 0.12;
      const maxTiltX = 0.075;
      doorPivot.rotation.y = pointer.x * maxTiltY;
      doorPivot.rotation.x = pointer.y * maxTiltX;

      camera.position.z = 5.35 - p * 11.4;
      camera.position.y = 0.12 - p * 0.52;
      camera.lookAt(0, 0.08 - p * 0.18, -p * 9);

      doorPivot.scale.setScalar(1 + p * 0.28);

      // Inner “next section” only once we’re far enough into the scroll (not on first motion).
      innerGroup.visible = rawP > 0.72;
      innerGroup.position.z = -42 + p * 26;

      // Reference (e.g. portal-to-the-future): stay dark through the full door passage; white only in the final segment.
      const postDoorStart = 0.78;
      const whiteT = clamp01((rawP - postDoorStart) / (1 - postDoorStart));
      const whiteMix = easeInOutCubic(whiteT);
      sceneBg.copy(blackBg).lerp(whiteBg, whiteMix);

      const pastDoor = rawP > postDoorStart;
      floorPlane.visible = !pastDoor;
      threshold.visible = !pastDoor;
      doorPivot.visible = rawP < 0.88;

      const shell = shellRef.current;
      if (shell) {
        const v = Math.round(255 * whiteMix);
        shell.style.backgroundColor = `rgb(${v},${v},${v})`;
      }
      const heroUi = heroUiRef.current;
      if (heroUi) {
        heroUi.style.opacity = String(clamp01(1 - whiteMix * 1.4));
      }

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);

      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
      renderer.dispose();
      bumpTex.dispose();
      pillarGeo.dispose();
      archTubeGeo.dispose();
      stoneMat.dispose();
      portalGlowGeo.dispose();
      portalGlowMat.dispose();
      thresholdGeo.dispose();
      thresholdMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      reflectGeo.dispose();
      reflectMat.dispose();
      backGeo.dispose();
      backMat.dispose();
    };
  }, []);

  return (
    <div ref={shellRef} className="relative min-h-[260vh] bg-black">
      <div ref={hostRef} className="fixed inset-0 z-0" aria-hidden />
      <div
        ref={heroUiRef}
        className="pointer-events-none fixed bottom-8 right-8 z-10 font-[family-name:var(--font-geist-sans)] text-xs tracking-wide text-white/50"
      >
        Scroll to explore
      </div>
    </div>
  );
}