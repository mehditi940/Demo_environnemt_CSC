import React, { useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const DrawTool = ({ modelRef }) => {
  const { camera, gl, scene } = useThree();
  const [positions, setPositions] = useState([]);
  const lineRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = new THREE.Vector2();

  // Initialize raycaster and mouse vector
  const handlePointerDown = (event) => {
    if (!modelRef?.current) return;

    const rect = gl.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      setPositions((prev) => [...prev, point.clone()]);
    }
  };

  // Handle pointer move to add points
  React.useEffect(() => {
    gl.domElement.addEventListener("pointerdown", handlePointerDown);
    return () => gl.domElement.removeEventListener("pointerdown", handlePointerDown);
  }, [gl]);

  return positions.length > 1 ? (
    <line>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={positions.length}
          array={new Float32Array(positions.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="red" linewidth={2} />
    </line>
  ) : null;
};

export default DrawTool;
