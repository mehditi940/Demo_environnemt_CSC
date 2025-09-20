import { InferSelectModel, relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { roomSchema } from "./room";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema } from "drizzle-zod";

export type Patient = InferSelectModel<typeof patientSchema>;

export const patientSchema = sqliteTable("patients", {
  id: text()
    .primaryKey()
    .$defaultFn(() => createId()),
  nummer: text().notNull().unique(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});

export const patientRelations = relations(patientSchema, ({ many }) => ({
  rooms: many(roomSchema),
}));

export const patientInsertSchema = createInsertSchema(patientSchema);
