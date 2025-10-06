import React, { useEffect, useRef } from "react";

export default function UnityContainer() {
  const unityCanvasReference = useRef(null);

  useEffect(() => {
    const loadUnity = async () => {
      const script = document.createElement("script");
      script.src = "/UnityWebViewer/Build/UnityWebViewer.loader.js";
      script.onload = () => {
        window
          .createUnityInstance(unityCanvasReference.current, {
            dataUrl: "/UnityWebViewer/Build/UnityWebViewer.data",
            frameworkUrl: "/UnityWebViewer/Build/UnityWebViewer.framework.js",
            codeUrl: "/UnityWebViewer/Build/UnityWebViewer.wasm",
            streamingAssetsUrl: "/UnityWebViewer/StreamingAssets",
            companyName: "UMC",
            productName: "Unity WebGL Viewer",
            productVersion: "0.0.1",
          })
          .then((unityInstance) => {
            console.log("Unity loaded", unityInstance);
          })
          .catch((error) => {
            console.error(error);
          });
      };
      document.body.appendChild(script);
    };

    loadUnity();
  }, []);

  return (
    <canvas id="unity-canvas" ref={unityCanvasReference} width={1280} height={800}></canvas>
  );
}
