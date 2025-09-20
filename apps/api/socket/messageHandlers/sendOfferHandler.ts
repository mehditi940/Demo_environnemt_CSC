import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  type: z.string(),
  offer: z.any(),
});

export const sendOfferHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("sendOfferMessage", parsedMessage);
  } catch (error) {
    debugLogger("Error in sendOfferHandler:", error);

    socket.emit("handler_error", error);
  }
};
