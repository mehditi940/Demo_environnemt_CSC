import React, { useRef, useState, useEffect, Suspense } from "react";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../styles/frame.css";
import { useSocket } from "../../../service/socketHandler";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import dummyAPI, { API_BASE_URL } from "../../../service/apiHandler";
import LiveStreamViewer from "../../components/view/LiveStreamViewer";
import UnityContainer from "../../components/model_viewer/UnityContainer";
import ModelViewer from "../../components/model_viewer/ModelFrame";


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
  const [fileExtension, setFileExtension] = useState(null);

  useEffect(() => {
    const fetchAndCreateUrl = async () => {
      try {
        const room = await dummyAPI.room.get_room(roomId);

        const model = room.models[0];
        if (!model) {
          console.error("No model found in the room");
          return;
        }

        const fileUrl = `${API_BASE_URL}/model/${model.id}`;
        
        // Extract file extension from the original model path
        const fileExt = model.path.split('.').pop().toLowerCase();
        console.log("Original model path:", model.path);
        console.log("Detected file extension:", fileExt);
        console.log("File URL:", fileUrl);
        console.log("Model data:", model);
        setFileExtension(fileExt);

        // Check if model has content in database
        if (!model.content) {
          console.error("Model has no content in database:", model);
          alert(`Dit 3D model is niet beschikbaar in de database.

Dit kan gebeuren omdat:
• Het model is geüpload voordat de database opslag werd geïmplementeerd
• Het model moet opnieuw worden geüpload

Oplossing: Upload het model opnieuw in de kamer.`);
          return;
        }

        // Check file size before downloading
        const headResponse = await fetch(fileUrl, {
          method: 'HEAD',
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (!headResponse.ok) {
          if (headResponse.status === 404) {
            alert(`3D model niet gevonden in database.

Dit model moet opnieuw worden geüpload.
Ga terug naar de kamer en upload het model opnieuw.`);
            return;
          }
          throw new Error(`Failed to check file: ${headResponse.status}`);
        }

        const contentLength = headResponse.headers.get('content-length');
        const fileSizeInMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
        
        console.log("File size:", fileSizeInMB.toFixed(2), "MB");

        // Check if file is too large (limit to 50MB for web loading)
        if (fileSizeInMB > 50) {
          console.error("File too large for web loading:", fileSizeInMB.toFixed(2), "MB");
          alert(`Bestand is te groot (${fileSizeInMB.toFixed(2)} MB). 

Dit model is waarschijnlijk bedoeld voor 3D printing, niet voor web weergave.

Oplossingen:
• Zoek een "low-poly" of "web-ready" versie
• Gebruik Blender om het model te optimaliseren
• Probeer OBJ formaat (beter gecomprimeerd)
• Maximum grootte is 50 MB voor web weergave`);
          return;
        }

        const url = await downloadFileAsBlobURL(fileUrl, {
          Authorization: `Bearer ${token}`,
        });
        setLocalUrl(url);

        // Optional: cleanup after unmount
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error loading model:", err);
        alert("Fout bij het laden van het 3D model. Controleer of het bestand geldig is en niet te groot.");
      }
    };

    fetchAndCreateUrl();
  }, [roomId, token]);

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

  // Removed unused handlers (pencil/mouse/lock) to satisfy linter

  // Removed unused handleReset to satisfy linter

  useEffect(() => {
    socketHandler.start();

    return () => {
      socketHandler.leaveRoom();
    };
  }, []);

  return (
    <div className="page-container">
      <LiveStreamViewer roomId={roomId} token={token} />

      {/* ControlsContainer removed: component not present; can re-add when available */}

      <div className="large-model-container">
        {localUrl ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ModelViewer
              modelPath={localUrl}
              fileExtension={fileExtension}
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
    </div>
  );
};

export default ViewPage;
