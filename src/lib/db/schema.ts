import { relations } from "drizzle-orm";
import {
  serial,
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  integer,
  bigint,
  time,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("userRole", ["admin", "user", "doctor"]);

export const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  phone: varchar("phone", { length: 255 }).unique().notNull(),
  nationalId: varchar("nationalId", { length: 255 }).unique().notNull(),
  age: varchar("age", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  //
  // chronicDisease: varchar("diesease", { length: 255 }).notNull(),
  // frequentMedications: varchar("frequentMedications", { length: 255 }).notNull(),
  // knownAllergies: varchar("knownAllergies", { length: 255 }).notNull(),
  // weight: integer("weight").notNull(),
  // height: integer("height").notNull(),  
  // address: varchar("address", { length: 255 }).notNull(),
  // admission: varchar('admission', { length: 255 }).notNull(),
  role: UserRole("userRole").default("user"),
});

export const adminTable = pgTable("admin", {
  id: serial("id").primaryKey().notNull(),
  super: boolean("super").notNull().default(false),
  user_id: text("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const doctorTable = pgTable("doctor", {
  id: serial("id").primaryKey().notNull(),
  specialty: varchar("specialty", { length: 255 }),
  user_id: text("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const workDaysTable = pgTable('work_days', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctorTable.id, { onDelete: 'cascade' }),
  day: text('day').notNull(), // e.g., 'Monday', 'Tuesday', etc.
});

export const workHoursTable = pgTable('work_hours', {
  id: serial('id').primaryKey(),
  workDayId: integer('work_day_id').notNull().references(() => workDaysTable.id, { onDelete: 'cascade' }),
  startAt: time('start_time').notNull(),
  endAt: time('end_time').notNull(),
});

// relations

export const userRelations = relations(userTable, ({ one }) => ({
  doctor: one(doctorTable, {
    fields: [userTable.id],
    references: [doctorTable.user_id],
  }),
  admin: one(adminTable, {
    fields: [userTable.id],
    references: [adminTable.user_id],
  }),
}));

export const doctorRelations = relations(doctorTable, ({ many }) => ({
  workDays: many(workDaysTable),
}));

export const workDayRelations = relations(workDaysTable, ({ one, many }) => ({
  doctor: one(doctorTable, {
      fields: [workDaysTable.doctorId],
      references: [doctorTable.id],
  }),
  workHours: many(workHoursTable),
}));

export const workHourRelations = relations(workHoursTable, ({ one }) => ({
  workDay: one(workDaysTable, {
      fields: [workHoursTable.workDayId],
      references: [workDaysTable.id],
  }),
}));

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
