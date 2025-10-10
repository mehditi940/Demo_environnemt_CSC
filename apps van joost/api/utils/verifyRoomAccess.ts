import db from "../schemas/db";
import { Role, UserInfo } from "../schemas/user";

// Function to verify if a user has access to a room
export const verifyRoomAccess = async (user: UserInfo, roomId: string) => {
  if (!user) {
    return false;
  }

  //If the user is admin or system, allow access to all rooms
  if (user.role === Role.Admin || user.role === Role.System) {
    return true;
  }

  // Check if the user is the creator of the room
  const room = await db.room.findFirst({
    where: {
      id: roomId,
      createdBy: user.id
    }
  });

  if (room) {
    return true;
  }

  // Check if the user is a member of the room
  const userRoom = await db.userRoom.findFirst({
    where: {
      userId: user.id,
      roomId: roomId
    }
  });

  if (userRoom) {
    return true;
  }

  // If the user is not the creator or a member of the room, deny access
  return false;
};
