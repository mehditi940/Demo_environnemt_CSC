import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  value: z.boolean(),
});

export const lockModelHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("lockModelCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in lockModelHandler:", error);

    socket.emit("handler_error", error);
  }
};
