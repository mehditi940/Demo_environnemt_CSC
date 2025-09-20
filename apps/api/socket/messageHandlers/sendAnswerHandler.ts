import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  type: z.string(),
  answer: z.any(),
});

export const sendAnswerHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("sendAnswerMessage", parsedMessage);
  } catch (error) {
    debugLogger("Error in sendAnswerHandler:", error);

    socket.emit("handler_error", error);
  }
};
