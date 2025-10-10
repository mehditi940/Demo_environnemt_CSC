import { useState } from "react";
import { useSocket } from "../../../service/socketHandler";

const LiveStreamViewer = ({ roomId, token }) => {
  const [canStartStream, setCanStartStream] = useState(false);
  const [activeStream, setActiveStream] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const [peerConnection, setPeerConnection] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [stunServers, setStunServers] = useState(null);

  // Socket
  const socketHandler = useSocket(roomId, token);

  socketHandler.recieve.startStream = (stunServers) => {
    setStunServers(stunServers);
    console.log("Received STUN servers:", stunServers);
    setCanStartStream(true);
  };

  socketHandler.recieve.sendOffer = async (offer) => {
    console.log("Received offer:", offer);
    if (peerConnection) {
      await createAnswer(offer.offer);
    } else {
      console.error("Peer connection not initialized.");
    }
  };

  socketHandler.recieve.sendAnswer = async (answer) => {
    console.log("Received answer:", answer);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer.answer);
    } else {
      console.error("Peer connection not initialized.");
    }
  };

  // WEBRTC
  const createOffer = async () => {
    const peerConnection = new RTCPeerConnection(stunServers);
    setPeerConnection(peerConnection);
    const remoteStream = new MediaStream();
    setRemoteStream(remoteStream);

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        socketHandler.send.sendCandidate({
          type: "candidate",
          canidate: event.candidate,
        });
      }
    };

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log("Created offer:", offer);
    socketHandler.send.sendOffer({
      type: "offer",
      offer: offer,
    });
  };

  const createAnswer = async (offer) => {
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socketHandler.send.sendAnswer({
      type: "answer",
      offer: answer,
    });
  };

  // Button Handlers
  const onStartStream = () => {
    if (!canStartStream) {
      console.error("Cannot start stream, permission not granted.");
      return;
    }
    createOffer();
    setActiveStream(true);
  };

  const onFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div
      className={
        "livestream-container " +
        (fullscreen
          ? "livestream-container-fullscreen"
          : "livestream-container-small")
      }
    >
      <div className="livestream-video">
        {activeStream ? (
          <video className="livestream-video-element" src={remoteStream} />
        ) : (
          <div className="livestream-placeholder">
            <button className="livestream-start-button" onClick={onStartStream}>
              {canStartStream
                ? "Start Live Stream"
                : "Waiting for hololens to connect..."}
            </button>
          </div>
        )}
      </div>
      <button className="fullscreen-button" onClick={onFullscreen}>
        ⛶
      </button>
    </div>
  );
};

export default LiveStreamViewer;
