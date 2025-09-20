import { sql } from "drizzle-orm";
import { InferSelectModel, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { roomSchema } from "./room";
import { modelSchema } from "./model";
import { createId } from "@paralleldrive/cuid2";

export type User = InferSelectModel<typeof userSchema>;

export type UserInfo = Pick<User, "id" | "firstName" | "email" | "role">;

export const userSchema = sqliteTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text().unique().notNull(),
  password: text().notNull(),
  salt: text().notNull(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  role: text({ enum: ["user", "admin", "super-admin", "system"] }).default(
    "user"
  ),
  deleted: text("deleted").default("false"),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  
});

export const userRelations = relations(userSchema, ({ many }) => ({
  rooms: many(roomSchema),
  models: many(modelSchema),
}));
