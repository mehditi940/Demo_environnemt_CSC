import React, { useRef, useState, Suspense, useEffect } from "react";
import ControlsContainer from "../../components/model/ControlsContainer";
import ModelViewer from "../../components/model/ModelFrame";
import Button from "../../components/Button";
import FloatingMenu from "../../components/FloatingMenu";
import LoadingSpinner from "../../components/LoadingSpinner";
import ToolMenu from "../../components/model/drawing/ToolMenu";
import "../../styles/frame.css";
import { useSocket } from "../../../service/socketHandler";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import dummyAPI from "../../../service/apiHandler";
import LiveStreamViewer from "../../components/view/LiveStreamViewer";

async function downloadFileAsBlobURL(url, headers) {
  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  const blob = await response.blob();
  const blobURL = URL.createObjectURL(blob);
  return blobURL;
}

const ViewPage = () => {
  const { roomId } = useParams();
  const token = localStorage.getItem("authToken");

  const [parts, setParts] = useState([]);
  const [partSettings, setPartSettings] = useState({});
  const [drawMode, setDrawMode] = useState("mouse");
  const [isLocked, setIsLocked] = useState(false);
  const hasLoadedParts = useRef(false);
  const modelRef = useRef();
  const socketHandler = useSocket(roomId, token);

  const [localUrl, setLocalUrl] = useState(null);

  useEffect(() => {
    const fetchAndCreateUrl = async () => {
      const room = await dummyAPI.room.get_room(roomId);

      const model = room.models[0];
      if (!model) {
        console.error("No model found in the room");
        return;
      }

      const fileUrl = `${import.meta.env.VITE_API_URL}/static/${model.path}`;

      try {
        const url = await downloadFileAsBlobURL(fileUrl, {
          Authorization: `Bearer ${token}`,
        });
        setLocalUrl(url);

        // Optional: cleanup after unmount
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAndCreateUrl();
  }, [roomId]);

  const onPartsLoaded = (newParts) => {
    if (hasLoadedParts.current) return;
    hasLoadedParts.current = true;

    const settingsMap = newParts.reduce((acc, part) => {
      acc[part.name] = { visible: true, opacity: 1.0 };
      return acc;
    }, {});
    setParts(newParts);
    setPartSettings(settingsMap);
  };

  const handlePencil = () => {
    setDrawMode("pencil");
    setIsLocked(true);
    socketHandler.send.lockModel(true);
  };

  const handleMouse = () => {
    setDrawMode("mouse");
    setIsLocked(false);
    socketHandler.send.lockModel(false);
  };

  const handleLock = () => {
    setIsLocked((prev) => !prev);
    socketHandler.send.lockModel(!isLocked);
  };

  const handleReset = () => {
    setDrawMode("mouse");

    const resetSettings = {};
    parts.forEach((part) => {
      resetSettings[part.name] = { visible: true, opacity: 1.0 };
    });
    socketHandler.send.reset();
    setPartSettings(resetSettings);

    if (modelRef.current) {
      modelRef.current.clearDrawing();
      modelRef.current.resetRotation();
      modelRef.current.resetCamera();
    }
  };

  useEffect(() => {
    socketHandler.start();

    return () => {
      socketHandler.leaveRoom();
    };
  }, []);

  return (
    <div className="page-container">
      <ToolMenu
        onMouse={handleMouse}
        onPencil={handlePencil}
        onReset={handleReset}
        onLock={handleLock}
        isLocked={isLocked}
      />

      <LiveStreamViewer roomId={roomId} token={token} />

      <ControlsContainer
        parts={parts}
        partSettings={partSettings}
        onTogglePart={(partName, isVisible) => {
          socketHandler.send.layerToggle(partName, isVisible);
          setPartSettings((prev) => ({
            ...prev,
            [partName]: { ...prev[partName], visible: isVisible },
          }));
        }}
        onOpacityChange={(partName, opacityValue) => {
          socketHandler.send.layerTransparency(partName, opacityValue);
          setPartSettings((prev) => ({
            ...prev,
            [partName]: { ...prev[partName], opacity: opacityValue },
          }));
        }}
      />

      <div className="large-model-container">
        {localUrl ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ModelViewer
              modelPath={localUrl}
              partSettings={partSettings}
              onPartsLoaded={onPartsLoaded}
              drawMode={drawMode}
              isLocked={isLocked}
              ref={modelRef}
            />
          </Suspense>
        ) : (
          <LoadingSpinner />
        )}
      </div>

      <div className="navigation-buttons">
        <Button
          text="Previous"
          onClick={() => console.log("Previous clicked")}
        />
        <Button text="Next" onClick={() => console.log("Next clicked")} />
      </div>

      <FloatingMenu
        items={["Menu item 1", "Menu item 2", "Menu item 3", "Menu item 4"]}
      />
    </div>
  );
};

export default ViewPage;
