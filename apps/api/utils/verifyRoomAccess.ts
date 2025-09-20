import db from "../schemas/db";
import { roomSchema, usersToRooms } from "../schemas/room";
import { and, eq } from "drizzle-orm";
import { UserInfo } from "../schemas/user";

// Function to verify if a user has access to a room
export const verifyRoomAccess = async (user: UserInfo, roomId: string) => {
  if (!user) {
    return false;
  }

  //If the user is super-admin or system, allow access to all rooms
  if (user.role === "super-admin" || user.role === "system") {
    return true;
  }

  // Check if the user is the creator of the room
  const rooms = await db
    .select()
    .from(roomSchema)
    .where(and(eq(roomSchema.id, roomId), eq(roomSchema.createdBy, user.id)));

  if (rooms.length > 0) {
    return true;
  }

  // Check if the user is a member of the room
  const userRooms = await db
    .select()
    .from(usersToRooms)
    .where(
      and(eq(usersToRooms.userId, user.id), eq(usersToRooms.roomId, roomId))
    );

  if (userRooms.length > 0) {
    return true;
  }

  // If the user is not the creator or a member of the room, deny access
  return false;
};
