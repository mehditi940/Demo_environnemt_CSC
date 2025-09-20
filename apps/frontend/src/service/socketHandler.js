import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export class SocketHandler {
  #roomID = null;
  #userToken = null;
  #socket = null;

  constructor() {
    if (SocketHandler.instance) {
      return SocketHandler.instance;
    }

    SocketHandler.instance = this;
  }

  setRoomProperties(roomID, userToken) {
    this.#roomID = roomID;
    this.#userToken = userToken;
  }

  /**
   * Singleton instance
   * @returns {SocketHandler}
   */
  static getInstance() {
    return SocketHandler.instance;
  }

  start() {
    // Connect to the socket.io server with authentication
    this.#socket = io(import.meta.env.VITE_API_URL, {
      extraHeaders: {
        authorization: `bearer ${this.#userToken}`,
      },
      query: {
        roomId: this.#roomID,
      },
    });

    console.log("Starting socket connection...", this.#roomID);

    // Once connected, join the specific room
    this.#socket.on("connect", () => {
      console.log("Connected to socket server with ID:", this.#socket.id);
      this.#join();
    });

    this.#socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.#socket.on("resetCommand", (data) => {
      this.recieve.reset(data);
    });

    this.#socket.on("laserCommand", (data) => {
      this.recieve.laser(data);
    });

    this.#socket.on("drawCommand", (data) => {
      this.recieve.draw(data);
    });

    this.#socket.on("lockModelCommand", (data) => {
      this.recieve.lockModel(data);
    });

    this.#socket.on("rotateCommand", (data) => {
      this.recieve.rotate(data);
    });

    this.#socket.on("selectModelCommand", (data) => {
      this.recieve.selectModel(data);
    });

    this.#socket.on("layerTransparencyCommand", (data) => {
      this.recieve.layerTransparency(data);
    });

    this.#socket.on("layerToggleCommand", (data) => {
      this.recieve.layerToggle(data);
    });

    this.#socket.on("userJoined", (data) => {
      this.recieve.userJoined(data);
    });

    this.#socket.on("userLeft", (data) => {
      this.recieve.userLeft(data);
    });

    this.#socket.on("startStream", (data) => {
      this.recieve.startStream(data);
    });
    this.#socket.on("sendOffer", (data) => {
      this.recieve.sendOffer(data);
    });
    this.#socket.on("sendCandidate", (data) => {
      this.recieve.sendCandidate(data);
    });
    this.#socket.on("sendAnswer", (data) => {
      this.recieve.sendAnswer(data);
    });
  }

  // Join a room
  #join() {
    this.#socket?.emit("join");
  }

  // Leave the room (optional)
  leaveRoom() {
    this.#socket?.disconnect();
    this.#socket = null;
    this.#roomID = null;
    this.#userToken = null;
  }

  //Event emitters
  send = {
    /**
     * Reset the model to its initial state
     */
    reset() {
      console.log("Resetting model...");
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("reset");
    },

    /**
     * Sends position of the laser to the server
     * @param {Number} x X coordinate of the laser
     * @param {Number} y Y coordinate of the laser
     * @param {Number} z Z coordinate of the laser
     * @param {Boolean} laserOn
     */
    laser(x, y, z, laserOn) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("laser", { x, y, z, laserOn });
    },

    /**
     * Sends the position of the point to the server
     * @param {Number} x X coordinate of the laser
     * @param {Number} y Y coordinate of the laser
     * @param {Number} z Z coordinate of the laser
     */
    draw(x, y, z) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("draw", { x, y, z });
    },

    /**
     * Locks the model to prevent it from being moved
     * @param {Boolean} value True to lock the model, false to unlock it
     */
    lockModel(value) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("lockModel", { value });
    },

    /**
     * Sends the rotation of the model to the server
     * @param {Number} horizontal Horizontal rotation of the model (-360 to 360)
     * @param {Number} vertical Vertical rotation of the model (-360 to 360)
     */
    rotate(horizontal, vertical) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("rotate", { horizontal, vertical });
    },

    /**
     * Selects a model in the room
     * @param {String} modelId The ID of the model to select
     */
    selectModel(modelId) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("selectModel", { modelId });
    },

    /**
     * Changes the transparency of a layer in the model
     * @param {String} layerId The ID of the layer to change
     * @param {Number} value The value to set for the layer (0-1)
     *
     */
    layerTransparency(layerId, value) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("layerTransparency", { layerId, value });
    },

    /**
     * Toggles the visibility of a layer in the model
     * @param {String} layerId The ID of the layer to toggle
     * @param {Boolean} value The value to set for the layer (true for on, false for off)
     */
    layerToggle(layerId, value) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("layerToggle", { layerId, value });
    },

    //WEBRTC Events
    /**
     * Sends a message to the server to start the stream
     * This is used to initiate the WebRTC connection for streaming video/audio
     */
    startStream() {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("startStream", {});
    },

    /**
     * Sends an offer to the server for WebRTC connection
     * @param {String} type The type of offer (e.g., "video", "audio")
     * @param {Object} offer The WebRTC offer object containing SDP and other parameters
     */
    sendOffer(type, offer) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("sendOffer", { type, offer });
    },

    /**
     * Sends an candidate to the server for WebRTC connection
     * @param {String} type The type of candidate (e.g., "video", "audio")
     * @param {Object} candidate The WebRTC candidate object containing SDP and other parameters
     */
    sendCandidate(type, candidate) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("sendCandidate", { type, candidate });
    },

    /**
     * Sends an answer to the server for WebRTC connection
     * @param {String} type The type of answer (e.g., "video", "audio")
     * @param {Object} answer The WebRTC answer object containing SDP and other parameters
     */
    sendAnswer(type, answer) {
      const socketInstance = SocketHandler.getInstance();
      socketInstance.#socket?.emit("sendAnswer", { type, answer });
    },
  };

  //Event listeners
  recieve = {
    /**
     * Listens for the reset event from the server
     */
    reset: () => {},

    /**
     * Listens for the laser position from the server
     */
    laser: () => {},

    /**
     * Listens for the draw position from the server
     */
    draw: () => {},

    /**
     * Listens for the model lock state from the server
     */
    lockModel: () => {},

    /**
     * Listens for the model rotation from the server
     */
    rotate: () => {},

    /**
     * Listens for the model selection from the server
     */
    selectModel: () => {},

    /**
     * Listens for the layer transparency from the server
     */
    layerTransparency: () => {},

    /**
     * Listens for the layer toggle from the server
     */
    layerToggle: () => {},

    /**
     * Listens for the user joined event from the server
     *
     */
    userJoined: () => {},

    /**
     * Listens for the user left event from the server
     */
    userLeft: () => {},

    /**
     * Listens for the WebRTC stream start event from the server
     */
    startStream: () => {},

    /**
     * Listens for the WebRTC offer from the server
     */
    sendOffer: () => {},

    /**
     * Listens for the WebRTC candidate from the server
     */
    sendCandidate: () => {},

    /**
     * Listens for the WebRTC answer from the server
     */
    sendAnswer: () => {},
  };
}

/**
 * Custom hook to manage socket connection
 * @param {String} roomID
 * @param {String} userToken
 * @returns {SocketHandler}
 */
export const useSocket = (roomID, userToken) => {
  const [socketHandler, setSocketHandler] = useState(new SocketHandler());

  useEffect(() => {
    const handler = new SocketHandler();
    handler.setRoomProperties(roomID, userToken);
    setSocketHandler(handler);

    // return () => {
    //   handler.leaveRoom();
    // };
  }, [roomID, userToken]);

  return socketHandler;
};
