import { Column, Many, relations } from "drizzle-orm";
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
  PgTimestampBuilderInitial,
  date,
} from "drizzle-orm/pg-core";

export const timestamps = (): {
  createdAt: PgTimestampBuilderInitial<"createdAt">;
  updatedAt: PgTimestampBuilderInitial<"updatedAt">;
} => ({
  createdAt: timestamp("createdAt", {
    withTimezone: true,
    mode: "date",
  }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", {
    withTimezone: true,
    mode: "date",
  }).defaultNow().notNull(),
});

export const departments = pgEnum("departments", ["opd", 'ipd']);
export const UserRole = pgEnum("userRole", ["admin", "user", "doctor", 'receptionist']);
export const UserGenders = pgEnum("userGender", ['male', 'female'])

export const userTable = pgTable("user", {
  id: text("id").primaryKey().notNull(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique().notNull(),
  nationalId: text("nationalId").unique().notNull(),
  dob: text("dob").notNull(), // date of birth
  gender: UserGenders("gender").notNull(),
  picture: text("picture").default('default.jpg').notNull(),
  password: text("password").notNull(),
  role: UserRole("role").default("user"),
  ...timestamps(),
});

export const userRelations = relations(userTable, ({ one, many }) => ({
  appointments: many(appointmentTable),
  folders: many(userMedicalFoldersTable),
  files: many(userMedicalFilesTable),
  reviews: many(reviewTable),
  doctor: one(doctorTable, {
    fields: [userTable.id],
    references: [doctorTable.userId],
  }),
  admin: one(adminTable, {
    fields: [userTable.id],
    references: [adminTable.userId],
  }),
  receptionist: one(receptionistTable, {
    fields: [userTable.id],
    references: [receptionistTable.userId],
  }),
  receipts: many(receiptTable)

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
  id: serial("id").primaryKey().notNull(),
  specialty: text("specialty"),
  fee: numeric("fee").notNull(),
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
  receipts: many(receiptTable)
}));

export const workDaysTable = pgTable('workDays', {
  id: serial('id').primaryKey(),
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
  id: serial('id').primaryKey(),
  workDayId: integer('workDayId').notNull().references(() => workDaysTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  from: text('from').notNull(),
  to: text('to').notNull(),
});

export const workHourRelations = relations(workHoursTable, ({ one }) => ({
  workDay: one(workDaysTable, {
    fields: [workHoursTable.workDayId],
    references: [workDaysTable.id],
  }),
}));


// ? Receptionist
export const receptionistTable = pgTable("receptionist", {
  id: serial("id").primaryKey().notNull(),
  department: departments("department").default("opd").notNull(),
  userId: text("userId")
    .unique()
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
});

export const receptionistRelations = relations(receptionistTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [receptionistTable.userId],
    references: [userTable.id],
  }),
  receipts: many(receiptTable)
}))

// ? Appointment

export const Status = pgEnum("status", ["pending", "cancelled", "completed"]);

export const appointmentTable = pgTable("appointment", {
  id: serial('id').primaryKey(),
  date: text("date").notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  department: departments("department").default('opd').notNull(),
  userId: text("userId")
    .references(() => userTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
  doctorId: integer("doctorId")
    .references(() => doctorTable.id, {
      onDelete: "cascade",
      onUpdate: "cascade"
    })
    .notNull(),
  status: Status("status").default("pending"),
  ...timestamps(),
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
    references: [doctorTable.id],
  }),
  receipt: one(receiptTable, {
    fields: [appointmentTable.id],
    references: [receiptTable.appointmentId],
  }),
  review: one(reviewTable, {
    fields: [appointmentTable.id],
    references: [reviewTable.appointmentId],
  }),
}))

export const reservationTable = pgTable("reservation", {
  id: serial('id').primaryKey(),
  history: text("history").notNull(),
  diagnosis: text("diagnosis").notNull(),
  laboratories: text("laboratory").notNull(),
  radiologies: text("radiology").notNull(),
  medicines: text("medicine").notNull(),
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
  id: serial('id').primaryKey(),
  laboratory: text("laboratory").notNull(),
  radiology: text("radiology").notNull(),
  medicine: text("medicine").notNull(),
  reservationId: integer("reservationId").notNull().references(() => reservationTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
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
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctorTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  rating: numeric("rating").notNull(),
  review: text("review"),
  ...timestamps(),
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
  id: serial('id').primaryKey(),
  name: text("name").notNull(),
  userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  ...timestamps(),
})

export const userMedicalFoldersRelations = relations(userMedicalFoldersTable, ({ one, many }) => ({
  files: many(userMedicalFilesTable),
  user: one(userTable, {
    fields: [userMedicalFoldersTable.userId],
    references: [userTable.id],
  }),
}))

export const userMedicalFilesTable = pgTable("userMedicalFiles", {
  id: serial('id').primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  folderId: integer("folderId").notNull().references(() => userMedicalFoldersTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  userId: text("userId").notNull().references(() => userTable.id, { onDelete: 'cascade', onUpdate: "cascade" }),
  ...timestamps(),
})

export const userMedicalFilesRelations = relations(userMedicalFilesTable, ({ one }) => ({
  folder: one(userMedicalFoldersTable, {
    fields: [userMedicalFilesTable.folderId],
    references: [userMedicalFoldersTable.id],
  }),
  user: one(userTable, {
    fields: [userMedicalFilesTable.userId],
    references: [userTable.id],
  }),
}))

// ? Receipt

export const receiptTable = pgTable("receipt", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(),
  amount: numeric("amount").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctorTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  appointmentId: integer("appointmentId")
    .notNull()
    .references(() => appointmentTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
  receptionistId: integer("receptionistId").references(() => receptionistTable.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  type: text("type").notNull(),
  ...timestamps(),
});

export const receiptRelations = relations(receiptTable, ({ one }) => ({
  user: one(userTable, {
    fields: [receiptTable.userId],
    references: [userTable.id],
  }),
  doctor: one(doctorTable, {
    fields: [receiptTable.doctorId],
    references: [doctorTable.id],
  }),
  appointment: one(appointmentTable, {
    fields: [receiptTable.appointmentId],
    references: [appointmentTable.id],
  }),
  receptionist: one(receptionistTable, {
    fields: [receiptTable.receptionistId],
    references: [receptionistTable.id],
  }),
}));

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