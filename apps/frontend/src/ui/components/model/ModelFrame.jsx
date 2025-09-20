import React, { Suspense, forwardRef, useRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import CameraControls from "./camera/CameraControls";
import CameraLight from "./camera/CameraLight"
import Model3MF from "../../../service/Model3mf";
import LoadingSpinner from "../LoadingSpinner";

const ModelViewer = forwardRef(({ modelPath, onPartsLoaded, partSettings, drawMode, isLocked }, ref) => {
  const model3mfRef = useRef();
  const orbitControlsRef = useRef();

  useImperativeHandle(ref, () => ({
    clearDrawing() {
      model3mfRef.current?.clearDrawing();
    },
    resetRotation() {
      model3mfRef.current?.resetRotation();
    },
    resetCamera() {
      orbitControlsRef.current?.reset();
    }
  }));

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <CameraLight />
        <CameraControls />
        <Model3MF
          ref={model3mfRef}
          modelPath={modelPath}
          onPartsLoaded={onPartsLoaded}
          partSettings={partSettings}
          drawMode={drawMode}
          enable={!isLocked}
        />
        <OrbitControls
          ref={orbitControlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          enabled={!isLocked}
        />
      </Canvas>
    </Suspense>
  );
});

export default ModelViewer;
