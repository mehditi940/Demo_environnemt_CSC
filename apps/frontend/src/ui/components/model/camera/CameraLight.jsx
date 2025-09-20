import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const CameraLight = () => {
  const lightRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position);
      lightRef.current.target.position.copy(
        camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()))
      );
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return <directionalLight ref={lightRef} intensity={1.2} />;
};

export default CameraLight;
