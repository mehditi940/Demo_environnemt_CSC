import { debugLogger } from "../../utils/debugLogger";
import { MessageHandler } from "../socketHandler";

export const joinHandler: MessageHandler = async ({ socket, roomId }) => {
  debugLogger(`User ${socket.request.user?.id} joined room ${roomId}`);
  socket.join(roomId);

  // Notify other users in the room about the new user
  socket.to(roomId).emit("userJoined", {
    user: socket.request.user,
    roomId,
  });
};
