import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Residential units table
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  unitNumber: varchar("unitNumber", { length: 50 }).notNull(),
  location: text("location"),
  area: int("area"), // in square meters
  tenantName: varchar("tenantName", { length: 255 }),
  tenantPhone: varchar("tenantPhone", { length: 20 }),
  tenantEmail: varchar("tenantEmail", { length: 320 }),
  status: mysqlEnum("status", ["active", "inactive", "vacant"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

// Water meters table
export const meters = mysqlTable("meters", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  meterNumber: varchar("meterNumber", { length: 50 }).notNull().unique(),
  meterType: varchar("meterType", { length: 50 }).default("water").notNull(),
  installationDate: timestamp("installationDate"),
  lastReading: int("lastReading").default(0).notNull(),
  lastReadingDate: timestamp("lastReadingDate"),
  status: mysqlEnum("status", ["active", "inactive", "faulty"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Meter = typeof meters.$inferSelect;
export type InsertMeter = typeof meters.$inferInsert;

// Meter readings table
export const meterReadings = mysqlTable("meter_readings", {
  id: int("id").autoincrement().primaryKey(),
  meterId: int("meterId").notNull(),
  reading: int("reading").notNull(),
  readingDate: timestamp("readingDate").defaultNow().notNull(),
  consumption: int("consumption"), // calculated as current - previous
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeterReading = typeof meterReadings.$inferSelect;
export type InsertMeterReading = typeof meterReadings.$inferInsert;

// Invoices table
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  consumption: int("consumption").notNull(),
  baseAmount: int("baseAmount").notNull(), // in cents
  additionalCharges: int("additionalCharges").default(0).notNull(),
  totalAmount: int("totalAmount").notNull(),
  status: mysqlEnum("status", ["draft", "issued", "paid", "overdue", "cancelled"]).default("issued").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Payments table
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  amount: int("amount").notNull(), // in cents
  paymentDate: timestamp("paymentDate").defaultNow().notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cash").notNull(),
  reference: varchar("reference", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Additional charges table
export const additionalCharges = mysqlTable("additional_charges", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId"),
  unitId: int("unitId"),
  description: varchar("description", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // in cents
  chargeDate: timestamp("chargeDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdditionalCharge = typeof additionalCharges.$inferSelect;
export type InsertAdditionalCharge = typeof additionalCharges.$inferInsert;

// Backup records table
export const backups = mysqlTable("backups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  backupName: varchar("backupName", { length: 255 }).notNull(),
  backupData: text("backupData"), // JSON stringified data
  backupSize: int("backupSize"), // in bytes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;
