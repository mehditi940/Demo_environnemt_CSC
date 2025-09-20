import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  modelId: z.string(),
});

export const selectModelHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("selectModelCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in selectModelHandler:", error);

    socket.emit("handler_error", error);
  }
};
