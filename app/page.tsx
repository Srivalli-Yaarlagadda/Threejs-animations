// import ThreeScene from "@/components/ThreeScene";
// export default function Home() {
//   return (
//     <main>
//       <ThreeScene />
//     </main>
//   );
// }

// "use client";

// import { useRef } from "react";
// import dynamic from "next/dynamic";

// // ✅ Props type for dynamic import
// type SceneProps = {
//   onAddRef: React.MutableRefObject<(() => void) | null>;
//   onRemoveRef: React.MutableRefObject<(() => void) | null>;
// };

// // ✅ Typed dynamic import (fixes your error)
// const ThreeScene1 = dynamic<SceneProps>(
//   () => import("../components/ThreeScene1"),
//   { ssr: false }
// );

// export default function Page() {
//   const addRef = useRef<(() => void) | null>(null);
//   const removeRef = useRef<(() => void) | null>(null);

//   return (
//     <main className="w-screen h-screen bg-neutral-800 overflow-hidden">
//       {/* Buttons */}
//       <div className="absolute top-0 left-0 w-full h-[10vh] flex flex-col sm:flex-row p-4 gap-2 z-10">
//         <button
//           onClick={() => addRef.current?.()}
//           className="px-4 py-2 bg-white text-green-600 font-bold uppercase rounded"
//         >
//           Add Cube
//         </button>

//         <button
//           onClick={() => removeRef.current?.()}
//           className="px-4 py-2 bg-white text-red-600 font-bold uppercase rounded"
//         >
//           Remove Cube
//         </button>
//       </div>

//       {/* Scene */}
//       <ThreeScene1 onAddRef={addRef} onRemoveRef={removeRef} />
//     </main>
//   );
// }

// "use client";

// import dynamic from "next/dynamic";

// const ThreeSceneResize = dynamic(
//   () => import("../components/ThreeSceneResize"),
//   { ssr: false }
// );

// export default function Page() {
//   return (
//     <main className="w-screen h-screen">
//       <ThreeSceneResize />
//     </main>
//   );
// }

// "use client";

// import dynamic from "next/dynamic";

// const ThreeSceneAA = dynamic(() => import("../components/ThreeSceneAA"), {
//   ssr: false,
// });

// export default function Page() {
//   return (
//     <main className="w-screen h-screen">
//       <ThreeSceneAA />
//     </main>
//   );
// }

// "use client";

// import dynamic from "next/dynamic";

// const ThreeGuiScene = dynamic(
//   () => import("../components/ThreeGuiScene"),
//   { ssr: false }
// );

// export default function Page() {
//   return <ThreeGuiScene />;
// }

// "use client";

// import dynamic from "next/dynamic";

// const DirectionalLightScene = dynamic(
//   () => import("../components/DirectionalLightScene"),
//   { ssr: false }
// );

// export default function Page() {
//   return <DirectionalLightScene />;
// }

// "use client";

// import dynamic from "next/dynamic";

// const PlaneGeometryScene = dynamic(
//   () => import("../components/Geometry/PlaneGeometryScene"),
//   { ssr: false }
// );

// const CircleGeometryScene = dynamic(
//   () => import("../components/Geometry/CircleGeometryScene"),
//   { ssr: false }
// );

// const RingGeometryScene = dynamic(
//   () => import("../components/Geometry/RingGeometryScene"),
//   { ssr: false }
// );

// const BoxGeometryScene = dynamic(
//   () => import("../components/Geometry/BoxGeometryScene"),
//   { ssr: false }
// );

// const TorusScene = dynamic(
//   () => import("../components/Geometry/TorusScene"),
//   { ssr: false }
// );

// const ConeScene = dynamic(
//   () => import("../components/Geometry/ConeScene"),
//   { ssr: false }
// );

// const TorusKnotScene = dynamic(
//   () => import("../components/Geometry/TorusKnotScene"),
//   { ssr: false }
// );

// export default function Page() {
//   return (
//     <div className="flex flex-col">
//       <PlaneGeometryScene />
//       <CircleGeometryScene />
//       <RingGeometryScene />
//       <BoxGeometryScene />
//       <TorusScene />
//       <ConeScene />
//       <TorusKnotScene />
//     </div>
//   );
// }

// import HypnoticRings from "../components/HypnoticRings";

// export default function Page() {
//   return <HypnoticRings />;
// }

// import MeshDepthMaterialScene from "@/components/Materials/MeshDepthMaterialScene";
// import MeshPhysicalMaterialScene from "@/components/Materials/MeshPhysicalMaterialScene"; //not perfect....

// export default function Page() {
//   return (
//     <>
//       {/* <MeshDepthMaterialScene /> */}
//       <MeshPhysicalMaterialScene />
//     </>
//   );
// }

// import ScrollDoorThreeScene from "@/components/ScrollDoorThreeScene";

// export default function Page() {
//   return <ScrollDoorThreeScene />;
// }

// import Light from "@/components/light";
// import Dmodel from "@/components/3Dmodel";
// export default function Page () {
//   return (
//   <>
//     {/* <Light />; */}
//     <Dmodel />;
//   </>
//   );
// }

import Tree from "@/components/tree3D";

export default function Page() {
  return <Tree />;
}