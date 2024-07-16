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
  numeric,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("userRole", ["admin", "user", "doctor"]);

export const userTable = pgTable("user", {
  id: text("id").primaryKey().unique().notNull(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique().notNull(),
  nationalId: text("nationalId").unique().notNull(),
  age: text("age").notNull(),
  gender: text("gender").notNull(),
  picture: text("picture").default('default.jpg').notNull(),
  password: text("password").notNull(),
  role: UserRole("userRole").default("user"),
});

export const userRelations = relations(userTable, ({ one, many }) => ({
  appointments: many(appointmentTable),
  folders: many(userMedicalFoldersTable),
  doctor: one(doctorTable, {
    fields: [userTable.id],
    references: [doctorTable.userId],
  }),
  admin: one(adminTable, {
    fields: [userTable.id],
    references: [adminTable.userId],
  }),
}));

export const adminTable = pgTable("admin", {
  id: serial("id").primaryKey().notNull(),
  super: boolean("super").notNull().default(false),
  userId: text("userId").unique()
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
});

// ? Doctor

export const doctorTable = pgTable("doctor", {
  id: serial("id").primaryKey().unique().notNull(),
  specialty: text("specialty"),
  userId: text("userId")
    .unique()
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
});

export const doctorRelations = relations(doctorTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [doctorTable.userId],
    references: [userTable.id],
  }),
  appointments: many(appointmentTable),
  workDays: many(workDaysTable),
  reviews: many(reviewTable), // New relation
}));



export const workDaysTable = pgTable('workDays', {
  id: serial('id').primaryKey().unique(),
  doctorId: integer('doctorId').notNull().references(() => doctorTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  day: text('day').notNull(), // e.g., 'Monday', 'Tuesday', etc.
});


export const workDayRelations = relations(workDaysTable, ({ one, many }) => ({
  doctor: one(doctorTable, {
    fields: [workDaysTable.doctorId],
    references: [doctorTable.id],
  }),
  workHours: many(workHoursTable),
}));

export const workHoursTable = pgTable('workHours', {
  id: serial('id').primaryKey().unique(),
  workDayId: integer('workDayId').notNull().references(() => workDaysTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  startAt: time('startAt').notNull(),
  endAt: time('endAt').notNull(),
});

export const workHourRelations = relations(workHoursTable, ({ one }) => ({
  workDay: one(workDaysTable, {
    fields: [workHoursTable.workDayId],
    references: [workDaysTable.id],
  }),
}));


// ? Appointment

export const Status = pgEnum("status", ["pending", "cancelled", "completed"]);

export const appointmentTable = pgTable("appointment", {
  id: serial('id').primaryKey().unique(),
  date: text("date").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  userId: text("userId")
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
  doctorId: text("doctorId")
    .references(() => doctorTable.userId, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
  status: Status("status").default("pending"),
});

export const appointmentRelation = relations(appointmentTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [appointmentTable.id],
    references: [reservationTable.appointmentId],
  }),
  user: one(userTable, {
    fields: [appointmentTable.userId],
    references: [userTable.id],
  }),
  doctor: one(doctorTable, {
    fields: [appointmentTable.doctorId],
    references: [doctorTable.userId],
  }),
  review: one(reviewTable, {
    fields: [appointmentTable.id],
    references: [reviewTable.appointmentId],
  })
}))

export const reservationTable = pgTable("reservation", {
  id: serial('id').primaryKey().unique(),
  history: text("history").notNull(),
  diagnosis: text("diagnosis").notNull(),
  laboratory: text("laboratory").notNull(),
  radiology: text("radiology").notNull(),
  medicine: text("medicine").notNull(),
  appointmentId: integer("appointmentId").notNull().references(() => appointmentTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
});


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

export const prescriptionTable = pgTable("prescription", {
  id: serial('id').primaryKey().unique(),
  laboratory: text("laboratory").notNull(),
  radiology: text("radiology").notNull(),
  medicine: text("medicine").notNull(),
  reservationId: integer("reservationId").notNull().references(() => appointmentTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
});

export const prescriptionRelation = relations(prescriptionTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [prescriptionTable.reservationId],
    references: [reservationTable.id],
  }),
}))

export const reviewTable = pgTable("review", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointmentId")
    .notNull()
    .references(() => appointmentTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  doctorId: text("doctorId")
    .notNull()
    .references(() => doctorTable.userId, { onDelete: 'cascade', onUpdate: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  rating: numeric("rating").notNull(),
  review: text("review"),
});

export const reviewRelations = relations(reviewTable, ({ one }) => ({
  appointment: one(appointmentTable, {
    fields: [reviewTable.appointmentId],
    references: [appointmentTable.id],
  }),
  doctor: one(doctorTable, {
    fields: [reviewTable.doctorId],
    references: [doctorTable.id],
  }),
  user: one(userTable, {
    fields: [reviewTable.userId],
    references: [userTable.id],
  }),
}));


// ? Files

export const userMedicalFoldersTable = pgTable("userMedicalFolders", {
  id: serial('id').primaryKey().unique(),
  name: text("name").unique().notNull(),
  userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
})

export const userMedicalFoldersRelations = relations(userMedicalFoldersTable, ({ one, many }) => ({
  files: many(userMedicalFilesTable),
  user: one(userTable, {
    fields: [userMedicalFoldersTable.userId],
    references: [userTable.id],
  }),
}))

export const userMedicalFilesTable = pgTable("userMedicalFiles", {
  id: serial('id').primaryKey().unique(),
  name: text("name").notNull(),
  folderId: integer("folderId").notNull().references(() => userMedicalFoldersTable.id, { onDelete: 'cascade', onUpdate: "cascade" })
})

export const userMedicalFilesRelations = relations(userMedicalFilesTable, ({ one }) => ({
  folder: one(userMedicalFoldersTable, {
    fields: [userMedicalFilesTable.folderId],
    references: [userMedicalFoldersTable.id],
  }),
}))


// ? session

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});