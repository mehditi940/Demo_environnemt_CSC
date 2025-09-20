import { z } from "zod";
import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

const RequestObject = z.object({
  layerId: z.string(),
  value: z.boolean(),
});

export const layerToggleHandler: MessageHandler = async ({
  socket,
  roomId,
  message,
}) => {
  try {
    const parsedMessage = RequestObject.parse(message);

    socket.to(roomId).emit("layerToggleCommand", parsedMessage);
  } catch (error) {
    debugLogger("Error in layerToggleHandler:", error);

    socket.emit("handler_error", error);
  }
};
