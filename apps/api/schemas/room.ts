import { InferSelectModel, relations, sql } from "drizzle-orm";
import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { userSchema } from "./user";
import { Model, modelSchema } from "./model";
import { createId } from "@paralleldrive/cuid2";
import { Patient, patientSchema } from "./patient";
import { createInsertSchema } from "drizzle-zod";

export type Room = InferSelectModel<typeof roomSchema>;

export const roomSchema = sqliteTable("rooms", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text().notNull(),
  patient: text(),
  type: text({ enum: ["patient", "surgeon", "demo"] }).default("patient"),
  createdBy: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

export const roomRelations = relations(roomSchema, ({ one, many }) => ({
  createdBy: one(userSchema, {
    fields: [roomSchema.createdBy],
    references: [userSchema.id],
  }),
  patient: one(patientSchema, {
    fields: [roomSchema.patient],
    references: [patientSchema.id],
  }),
  models: many(modelSchema),
  usersToRooms: many(usersToRooms),
}));

export const usersToRooms = sqliteTable(
  "users_to_groups",
  {
    userId: text("user_id")
      .notNull()
      .references(() => userSchema.id),
    roomId: text("rooms_id")
      .notNull()
      .references(() => roomSchema.id),
  },
  (t) => [primaryKey({ columns: [t.userId, t.roomId] })]
);

export const usersToRoomsRelations = relations(usersToRooms, ({ one }) => ({
  room: one(roomSchema, {
    fields: [usersToRooms.roomId],
    references: [roomSchema.id],
  }),
  user: one(userSchema, {
    fields: [usersToRooms.userId],
    references: [userSchema.id],
  }),  
}));

export const roomInsertSchema = createInsertSchema(roomSchema);

export type PopulatedRoom = Omit<Room, "patient"> & {
  createdBy: string;
  patient?: Pick<Patient, "id" | "nummer" | "firstName" | "lastName">;
  models: Pick<Model, "id" | "path" | "name">[];
};
