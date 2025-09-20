import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

export const disconnectHandler: MessageHandler = async ({ socket, roomId }) => {
  debugLogger(`User ${socket.request.user?.id} left room ${roomId}`);
  socket.leave(roomId);

  // Notify other users in the room about the user leaving
  socket.to(roomId).emit("userLeft", {
    user: socket.request.user,
    roomId,
  });
};
