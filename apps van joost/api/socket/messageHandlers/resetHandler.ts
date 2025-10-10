import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

// This handler is used to reset the state of the room. It emits a "resetCommand" event to all clients in the room.
export const resetHandler: MessageHandler = async ({ socket, roomId }) => {
  try {
    socket.to(roomId).emit("resetCommand");
  } catch (error) {
    debugLogger("Error in resetHandler:", error);

    socket.emit("handler_error", error);
  }
};
