import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from "react";
import { useThree, useLoader, useFrame } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import * as THREE from "three";
import { useSocket } from "../service/socketHandler";

const OBJModel = forwardRef(
  ({ modelPath, onPartsLoaded, partSettings, drawMode, enable }, ref) => {
    const { scene, camera, gl } = useThree();
    const modelRef = useRef();
    const rotationRef = useRef(new THREE.Euler(0, 0, 0));
    const [parts, setParts] = useState([]);
    const [loadingError, setLoadingError] = useState(null);

    const socketHandler = useSocket();

    const drawPointsRef = useRef([]);
    const [updateDraw, setUpdateDraw] = useState(false);
    const lineRef = useRef();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = new THREE.Vector2();
    const isDrawing = useRef(false);

    // Load OBJ model with error handling
    const rawModel = useLoader(OBJLoader, modelPath, (loader) => {
      // Add error handling for large files
      loader.onError = (error) => {
        console.error("OBJ Loader error:", error);
        setLoadingError(error);
      };
      return loader;
    });

    useEffect(() => {
      if (!rawModel) return;

      try {
        console.log("Processing OBJ model:", rawModel);
        const model = rawModel.clone(true);
        model.scale.set(1, 1, 1);
        
        model.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeBoundingSphere();
            child.geometry.computeVertexNormals();
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply proper material for OBJ
            if (!child.material || child.material.isMeshBasicMaterial) {
              child.material = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                shininess: 100,
                side: THREE.DoubleSide
              });
            }
            
            // Debug: Log mesh info
            console.log("OBJ Mesh found:", child.name, "Vertices:", child.geometry.attributes.position.count);
          }
        });

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim; // Scale to fit in a 2-unit box
        
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        
        console.log("OBJ Model centered and scaled:", { center, size, scale });

        scene.add(model);
        modelRef.current = model;

        const newParts = [];
        model.traverse((child) => {
          if (child.isMesh) {
            newParts.push({ name: child.name || "OBJ Part", object: child });
          }
        });

        setParts(newParts);
        if (onPartsLoaded) onPartsLoaded(newParts);

        return () => {
          scene.remove(model);
          modelRef.current = null;
        };
      } catch (error) {
        console.error("Error processing OBJ model:", error);
        setLoadingError(error);
        
        // Create a fallback cube if model loading fails
        const fallbackGeometry = new THREE.BoxGeometry(1, 1, 1);
        const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackMesh.name = "Fallback Model - OBJ Error";
        
        scene.add(fallbackMesh);
        modelRef.current = fallbackMesh;
        
        const fallbackParts = [{ name: "Fallback Model - OBJ Error", object: fallbackMesh }];
        setParts(fallbackParts);
        if (onPartsLoaded) onPartsLoaded(fallbackParts);
      }
    }, [rawModel, scene, onPartsLoaded]);

    useEffect(() => {
      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child.isMesh) {
            const settings = partSettings?.[child.name] || {
              visible: true,
              opacity: 1.0,
            };
            child.visible = settings.visible;
            child.material.transparent = true;
            child.material.opacity = settings.visible ? settings.opacity : 0;
          }
        });
      }
    }, [JSON.stringify(partSettings)]);

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (!enable) return;

        const step = Math.PI / 24;
        const newRot = rotationRef.current.clone();
        switch (event.key) {
          case "ArrowUp":
            newRot.x += step;
            break;
          case "ArrowDown":
            newRot.x -= step;
            break;
          case "ArrowLeft":
            newRot.z += step;
            break;
          case "ArrowRight":
            newRot.z -= step;
            break;
          case "PageUp":
            newRot.y += step;
            break;
          case "PageDown":
            newRot.y -= step;
            break;
          default:
            return;
        }
        rotationRef.current = newRot;
        socketHandler.send.rotate(newRot.x, newRot.z);
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enable]);

    useFrame(() => {
      if (modelRef.current) {
        modelRef.current.rotation.copy(rotationRef.current);
      }

      if (updateDraw && lineRef.current) {
        const positions = new Float32Array(
          drawPointsRef.current.flatMap((p) => [p.x, p.y, p.z])
        );
        const geometry = lineRef.current.geometry;
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setDrawRange(0, drawPointsRef.current.length);
        geometry.attributes.position.needsUpdate = true;

        setUpdateDraw(false);
      }
    });

    useEffect(() => {
      const handlePointerDown = () => {
        if (drawMode === "pencil" || drawMode === "eraser") {
          isDrawing.current = true;
        }
      };

      const handlePointerUp = () => {
        isDrawing.current = false;
      };

      const handlePointerMove = (event) => {
        if (!modelRef.current) return;
        if (!(drawMode === "pencil" || drawMode === "eraser")) return;
        if (!isDrawing.current) return;

        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse, camera);
        const intersects = raycaster.current.intersectObject(modelRef.current, true);

        if (intersects.length > 0) {
          const point = intersects[0].point.clone();

          if (drawMode === "pencil") {
            const normal = intersects[0].face.normal.clone().normalize();
            point.add(normal.multiplyScalar(0.1));
            drawPointsRef.current.push(point);
            socketHandler.send.draw(point.x, point.y, point.z);
            setUpdateDraw(true);
          } else if (drawMode === "eraser") {
            const eraseRadius = 0.1;
            drawPointsRef.current = drawPointsRef.current.filter(
              (p) => p.distanceTo(point) > eraseRadius
            );
            setUpdateDraw(true);
          }
        }
      };

      gl.domElement.addEventListener("pointerdown", handlePointerDown);
      gl.domElement.addEventListener("pointerup", handlePointerUp);
      gl.domElement.addEventListener("pointermove", handlePointerMove);

      return () => {
        gl.domElement.removeEventListener("pointerdown", handlePointerDown);
        gl.domElement.removeEventListener("pointerup", handlePointerUp);
        gl.domElement.removeEventListener("pointermove", handlePointerMove);
      };
    }, [camera, gl.domElement, drawMode]);

    const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
      return geo;
    }, []);

    useImperativeHandle(ref, () => ({
      clearDrawing() {
        drawPointsRef.current = [];
        if (lineRef.current) {
          const geometry = lineRef.current.geometry;
          geometry.setDrawRange(0, 0);
          geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([]), 3));
          geometry.attributes.position.needsUpdate = true;
        }
        setUpdateDraw(false);
      },
      resetRotation() {
        rotationRef.current.set(0, 0, 0);
      },
    }));

    // Show error message if loading failed
    if (loadingError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      );
    }

    return (
      <>
        {/* Fallback visible object if no model is loaded */}
        {parts.length === 0 && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="orange" />
          </mesh>
        )}
        <line ref={lineRef} geometry={geometry}>
          <lineBasicMaterial attach="material" color="red" linewidth={2} />
        </line>
      </>
    );
  }
);

export default OBJModel;
