import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

export const startStreamHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const stunServers = {
      iceServers: [{ urls: process.env.STUN_SERVERS?.split(",") }],
    };

    socket.to(roomId).emit("startStreamCommand", stunServers);
  } catch (error) {
    debugLogger("Error in startStreamHandler:", error);

    socket.emit("handler_error", error);
  }
};
