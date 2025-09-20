import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
  laserOn: z.boolean(),
});

// This handler is responsible for handling laser commands from the client
// and broadcasting them to other clients in the same room.
export const laserHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("laserCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in laserHandler:", error);

    socket.emit("handler_error", error);
  }
};
