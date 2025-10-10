import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { roomSchema } from "./room";
import { userSchema } from "./user";
import { createId } from "@paralleldrive/cuid2";
import { generateAlphanumericPincode } from "../utils/generateAlphanumericPincode";

export type Connection = InferSelectModel<typeof connectionSchema>;

export const connectionSchema = sqliteTable("connection", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  pinCode: text()
    .notNull()
    .$defaultFn(() => generateAlphanumericPincode()),

  startedBy: text().notNull(),
  roomId: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  validUntil: text()
    .notNull()
    .$defaultFn(() => {
      const date = new Date();
      date.setHours(date.getHours() + 1); // Set to 1 hour from now
      return date.toISOString();
    }),
});

export const connectionelations = relations(connectionSchema, ({ one }) => ({
  startedBy: one(userSchema, {
    fields: [connectionSchema.startedBy],
    references: [userSchema.id],
  }),
  room: one(roomSchema, {
    fields: [connectionSchema.roomId],
    references: [roomSchema.id],
  }),
}));

export interface ConnectionResponse {
  roomId: string;
  socketUrl: string;
  pinCode: string;
  qrCodeString: string;
}
