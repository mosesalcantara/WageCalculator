import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const establishments = sqliteTable("establishments", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  address: text("address").notNull(),
});

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  rate: real("rate").notNull(),
  establishment_id: integer("establishment_id").references(
    () => establishments.id
  )
});

export const establishmentsRelation = relations(establishments, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelation = relations(employees, ({ one }) => ({
  establishment: one(establishments, {
    fields: [employees.establishment_id],
    references: [establishments.id],
  }),
}));
