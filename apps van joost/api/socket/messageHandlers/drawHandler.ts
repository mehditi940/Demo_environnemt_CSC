import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

// This handler is responsible for handling drawing commands in the socket connection.
export const drawHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("drawCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in drawHandler:", error);

    socket.emit("handler_error", error);
  }
};
