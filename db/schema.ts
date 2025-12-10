import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const establishments = sqliteTable("establishments", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
});

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  last_name: text("last_name").notNull(),
  first_name: text("first_name").notNull(),
  middle_initial: text("middle_initial").notNull(),
  rate: real("rate").notNull(),
  start_day: text("start_day").notNull(),
  end_day: text("end_day").notNull(),
  establishment_id: integer("establishment_id")
    .notNull()
    .references(() => establishments.id),
});

export const violations = sqliteTable("violations", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  values: text("values", { mode: "json" }).notNull(),
  employee_id: integer("employee_id")
    .notNull()
    .references(() => employees.id),
});

export const wageOrders = sqliteTable("wageOrders", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  less_than_ten: real("less_than_ten").notNull(),
  ten_or_more: real("ten_or_more").notNull(),
});

export const holidays = sqliteTable("holidays", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
});

export const establishmentsRelation = relations(establishments, ({ many }) => ({
  employees: many(employees),
}));

export const employeesRelation = relations(employees, ({ one, many }) => ({
  establishment: one(establishments, {
    fields: [employees.establishment_id],
    references: [establishments.id],
  }),
  violations: many(violations),
}));

export const violationsRelation = relations(violations, ({ one }) => ({
  employee: one(employees, {
    fields: [violations.employee_id],
    references: [employees.id],
  }),
}));
