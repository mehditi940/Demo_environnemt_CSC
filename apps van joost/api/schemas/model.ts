import { InferSelectModel, relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userSchema } from "./user";
import { roomSchema } from "./room";
import { createId } from "@paralleldrive/cuid2";

export type Model = InferSelectModel<typeof modelSchema>;

export const modelSchema = sqliteTable("models", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  path: text().notNull(),
  content: text(), // Store base64 encoded file content (nullable for migration)
  mimeType: text(), // Store MIME type for proper serving (nullable for migration)
  addedBy: text().notNull(),
  roomId: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

export const modelRelations = relations(modelSchema, ({ one }) => ({
  addedBy: one(userSchema, {
    fields: [modelSchema.addedBy],
    references: [userSchema.id],
  }),
  room: one(roomSchema, {
    fields: [modelSchema.roomId],
    references: [roomSchema.id],
  }),
}));
