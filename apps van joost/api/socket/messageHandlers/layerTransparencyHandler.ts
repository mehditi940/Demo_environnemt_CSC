import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  layerId: z.string(),
  value: z.number().min(0).max(100),
});

export const layerTransparencyHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("layerTransparencyCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in layerTransparencyHandler:", error);

    socket.emit("handler_error", error);
  }
};
