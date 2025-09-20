import { useThree, useFrame } from "@react-three/fiber";
import { useEffect } from "react";

const CameraControls = () => {
  const { camera } = useThree();

  useFrame(() => {
    if (camera.position.z < 1) camera.position.z = 1;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "=" || event.key === "+") {
        camera.position.z = Math.max(1, camera.position.z - 2);
      } else if (event.key === "-") {
        camera.position.z += 2;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
};

export default CameraControls;
