import { Socket } from "socket.io";
import { UserInfo } from "../schemas/user";

import { debugLogger } from "../utils/debugLogger";
import { verifyRoomAccess } from "../utils/verifyRoomAccess";
import { joinHandler } from "./messageHandlers/joinHandler";
import { disconnectHandler } from "./messageHandlers/disconnectHandler";
import { layerToggleHandler } from "./messageHandlers/layerToggleHandler";
import { layerTransparencyHandler } from "./messageHandlers/layerTransparencyHandler";
import { selectModelHandler } from "./messageHandlers/selectModelHandler";
import { rotateHandler } from "./messageHandlers/rotateHandler";
import { lockModelHandler } from "./messageHandlers/lockModelHandler";
import { drawHandler } from "./messageHandlers/drawHandler";
import { laserHandler } from "./messageHandlers/laserHandler";
import { resetHandler } from "./messageHandlers/resetHandler";
import { startStreamHandler } from "./messageHandlers/startStreamHandler";
import { sendOfferHandler } from "./messageHandlers/sendOfferHandler";
import { sendCanidateHandler } from "./messageHandlers/sendCanidateHandler";
import { sendAnswerHandler } from "./messageHandlers/sendAnswerHandler";

type SocketWithUser = Socket & {
  request: {
    user?: UserInfo;
  };
};

interface SocketCallbackProps {
  socket: SocketWithUser;
  roomId: string;
  message: any;
}

export type MessageHandler = (props: SocketCallbackProps) => void;

//Creates a socket event handler that checks if the user has access to the room
const accessHandler = async (
  socket: SocketWithUser,
  roomId: string,
  event: string,
  messageHandler: MessageHandler
) => {
  socket.on(event, async (message) => {
    if (!socket.request.user) {
      debugLogger("User not authenticated, disconnecting socket.");
      socket.disconnect(true);
      return;
    }

    const hasAccess = await verifyRoomAccess(socket.request?.user, roomId);

    if (!hasAccess) {
      debugLogger(
        "User does not have access to this room, disconnecting socket."
      );
      socket.disconnect(true);
      return;
    }

    debugLogger(`Event ${event} triggered for room ${roomId}`);

    messageHandler({ socket, roomId, message });
  });
};

// Handler for socket events
// This function is called when a new socket connection is established
export const socketHandler = (socket: SocketWithUser) => {
  debugLogger(`New client connected: ${socket.id}`);

  const roomId = socket.handshake.query.roomId as string;
  if (!roomId) {
    debugLogger("No room ID provided, disconnecting socket.");
    socket.disconnect(true);
    return;
  }

  // Event handlers for a room
  accessHandler(socket, roomId, "join", joinHandler);
  accessHandler(socket, roomId, "disconnect", disconnectHandler);

  //Event handlers funtions
  accessHandler(socket, roomId, "layerToggle", layerToggleHandler);
  accessHandler(socket, roomId, "layerTransparency", layerTransparencyHandler);
  accessHandler(socket, roomId, "selectModel", selectModelHandler);
  accessHandler(socket, roomId, "rotate", rotateHandler);
  accessHandler(socket, roomId, "lockModel", lockModelHandler);
  accessHandler(socket, roomId, "draw", drawHandler);
  accessHandler(socket, roomId, "laser", laserHandler);
  accessHandler(socket, roomId, "reset", resetHandler);

  // WEBRTC events
  accessHandler(socket, roomId, "startStream", startStreamHandler);
  accessHandler(socket, roomId, "sendOffer", sendOfferHandler);
  accessHandler(socket, roomId, "sendCanidate", sendCanidateHandler);
  accessHandler(socket, roomId, "sendAnswer", sendAnswerHandler);

  // Error event
  socket.on("error", (error) => {
    console.error(`Socket error: ${error}`);
  });
};
