import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  type: z.string(),
  canidate: z.any(),
});

export const sendCanidateHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("sendCanidateMessage", parsedMessage);
  } catch (error) {
    debugLogger("Error in sendCanidateHandler:", error);

    socket.emit("handler_error", error);
  }
};
