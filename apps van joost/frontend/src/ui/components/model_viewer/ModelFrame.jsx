import React, { Suspense, forwardRef, useRef, useImperativeHandle } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ModelLoader from "../../../service/ModelLoader";
import STLModel from "../../../service/STLModel";
import OBJModel from "../../../service/OBJModel";
import LoadingSpinner from "../LoadingSpinner";

const ModelViewer = forwardRef(({ modelPath, fileExtension, onPartsLoaded, partSettings, drawMode, isLocked }, ref) => {
  const model3mfRef = useRef();
  const orbitControlsRef = useRef();
  
  // Debug logging
  console.log("ModelViewer - fileExtension:", fileExtension);
  console.log("ModelViewer - modelPath:", modelPath);

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
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        {fileExtension === 'stl' ? (
          <STLModel
            ref={model3mfRef}
            modelPath={modelPath}
            onPartsLoaded={onPartsLoaded}
            partSettings={partSettings}
            drawMode={drawMode}
            enable={!isLocked}
          />
        ) : fileExtension === 'obj' ? (
          <OBJModel
            ref={model3mfRef}
            modelPath={modelPath}
            onPartsLoaded={onPartsLoaded}
            partSettings={partSettings}
            drawMode={drawMode}
            enable={!isLocked}
          />
        ) : fileExtension ? (
          <ModelLoader
            ref={model3mfRef}
            modelPath={modelPath}
            onPartsLoaded={onPartsLoaded}
            partSettings={partSettings}
            drawMode={drawMode}
            enable={!isLocked}
          />
        ) : (
          <LoadingSpinner />
        )}
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
