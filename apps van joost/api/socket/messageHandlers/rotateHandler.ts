import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  vertical: z.number().min(-360).max(360),
  horizontal: z.number().min(-360).max(360),
});

export const rotateHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("rotateCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in rotateHandler:", error);

    socket.emit("handler_error", error);
  }
};
