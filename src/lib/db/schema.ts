import { Many, relations } from "drizzle-orm";
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
  doctorId: integer('doctor_id').notNull().references(() => doctorTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  day: text('day').notNull(), // e.g., 'Monday', 'Tuesday', etc.
});

export const workHoursTable = pgTable('work_hours', {
  id: serial('id').primaryKey(),
  workDayId: integer('work_day_id').notNull().references(() => workDaysTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  // day: text('day').notNull(), // e.g., 'Monday', 'Tuesday', etc.
  startAt: time('start_time').notNull(),
  endAt: time('end_time').notNull(),
});

export const Status = pgEnum("status", ["pending", "cancelled", "completed"]);

export const appointmentTable = pgTable("appointment", {
  id: serial('id').primaryKey(),
  date: text("date").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  user_id: text("user_id")
    .references(() => userTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  doctor_id: text("doctor_id")
    .references(() => doctorTable.id, {
      onDelete: "cascade",
    })
    .notNull(),
  status: Status("status").default("pending"),
});

export const reservationTable = pgTable("reservation", {
  id: serial('id').primaryKey(),
  history: text("history").notNull(),
  diagnosis: text("diagnosis").notNull(),
  laboratory: text("laboratory").notNull(),
  radiology: text("radiology").notNull(),
  medicine: text("medicine").notNull(),
  appointmentId: integer("appointment_id").notNull().references(() => appointmentTable.id, { onDelete: 'cascade' }),
});

export const prescriptionTable = pgTable("prescription", {
  id: serial('id').primaryKey(),
  laboratory: text("laboratory").notNull(),
  radiology: text("radiology").notNull(),
  medicine: text("medicine").notNull(),
  reservationId: integer("reservation_id").notNull().references(() => appointmentTable.id, { onDelete: 'cascade' }),
});

export const userMedicalFoldersTable = pgTable("user_medical_folders", {
  id: serial('id').primaryKey(),
  name: text("name").unique().notNull(),
  userId: text("user_id").notNull().references(() => userTable.id, { onDelete: 'cascade' }),
})

export const userMedicalFilesTable = pgTable("user_medical_files", {
  id: serial('id').primaryKey(),
  name: text("name").notNull(),
  folderId: integer("folder_id").notNull().references(() => userMedicalFoldersTable.id, { onDelete: 'cascade' })
})

// relations

export const userRelations = relations(userTable, ({ one, many }) => ({
  appointments: many(appointmentTable),
  folders: many(userMedicalFoldersTable),
  doctor: one(doctorTable, {
    fields: [userTable.id],
    references: [doctorTable.user_id],
  }),
  admin: one(adminTable, {
    fields: [userTable.id],
    references: [adminTable.user_id],
  }),
}));

export const doctorRelations = relations(doctorTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [doctorTable.user_id],
    references: [userTable.id],
  }),
  appointments: many(appointmentTable),
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


export const appointmentRelation = relations(appointmentTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [appointmentTable.id],
    references: [reservationTable.appointmentId],
  }),
  user: one(userTable, {
    fields: [appointmentTable.user_id],
    references: [userTable.id],
  }),
  doctor: one(doctorTable, {
    fields: [appointmentTable.doctor_id],
    references: [doctorTable.user_id],
  }),
}))

export const reservationRelation = relations(reservationTable, ({ one }) => ({
  appointment: one(appointmentTable, {
    fields: [reservationTable.appointmentId],
    references: [appointmentTable.id],
  }),
  prescription: one(prescriptionTable, {
    fields: [reservationTable.id],
    references: [prescriptionTable.reservationId],
  }),
}))

export const prescriptionRelation = relations(prescriptionTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [prescriptionTable.reservationId],
    references: [reservationTable.id],
  }),
}))

export const userMedicalFoldersRelations = relations(userMedicalFoldersTable, ({ one, many }) => ({
  files: many(userMedicalFilesTable),
  user: one(userTable, {
    fields: [userMedicalFoldersTable.userId],
    references: [userTable.id],
  }),
}))

export const userMedicalFilesRelations = relations(userMedicalFilesTable, ({ one }) => ({
  folder: one(userMedicalFoldersTable, {
    fields: [userMedicalFilesTable.folderId],
    references: [userMedicalFoldersTable.id],
  }),
}))

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});