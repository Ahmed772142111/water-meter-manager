import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "./_core/env";

let dbInstance: any = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  
  if (!ENV.databaseUrl) {
    console.error("DATABASE_URL is not configured");
    return null;
  }

  try {
    const pool = mysql.createPool(ENV.databaseUrl);
    dbInstance = drizzle(pool);
    return dbInstance;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return null;
  }
}
import {
  units,
  meters,
  meterReadings,
  invoices,
  payments,
  additionalCharges,
  backups,
  users,
  type InsertUnit,
  type InsertMeter,
  type InsertMeterReading,
  type InsertInvoice,
  type InsertPayment,
  type InsertAdditionalCharge,
  type InsertBackup,
  type InsertUser,
} from "../drizzle/schema";

// ============= UNITS OPERATIONS =============

export async function getUserUnits(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).where(eq(units.userId, userId));
}

export async function getUnitById(unitId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(units).where(eq(units.id, unitId));
  return result[0] || null;
}

export async function createUnit(data: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(units).values(data);
  return (result as any).insertId || 0;
}

export async function updateUnit(unitId: number, data: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(units).set(data).where(eq(units.id, unitId));
}

export async function deleteUnit(unitId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(units).where(eq(units.id, unitId));
}

// ============= METERS OPERATIONS =============

export async function getUnitMeters(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meters).where(eq(meters.unitId, unitId));
}

export async function getMeterById(meterId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(meters).where(eq(meters.id, meterId));
  return result[0] || null;
}

export async function getMeterByNumber(meterNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(meters)
    .where(eq(meters.meterNumber, meterNumber));
  return result[0] || null;
}

export async function createMeter(data: InsertMeter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(meters).values(data);
  return (result as any).insertId || 0;
}

export async function updateMeter(meterId: number, data: Partial<InsertMeter>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(meters).set(data).where(eq(meters.id, meterId));
}

export async function deleteMeter(meterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(meters).where(eq(meters.id, meterId));
}

// ============= METER READINGS OPERATIONS =============

export async function getMeterReadings(meterId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(meterReadings)
    .where(eq(meterReadings.meterId, meterId))
    .orderBy(desc(meterReadings.readingDate))
    .limit(limit);
}

export async function getLatestMeterReading(meterId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(meterReadings)
    .where(eq(meterReadings.meterId, meterId))
    .orderBy(desc(meterReadings.readingDate))
    .limit(1);
  return result[0] || null;
}

export async function createMeterReading(data: InsertMeterReading) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(meterReadings).values(data);
  return (result as any).insertId || 0;
}

// ============= INVOICES OPERATIONS =============

export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .where(eq(units.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export async function getUnitInvoices(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.unitId, unitId))
    .orderBy(desc(invoices.createdAt));
}

export async function getInvoiceById(invoiceId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId));
  return result[0] || null;
}

export async function getInvoiceByNumber(invoiceNumber: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.invoiceNumber, invoiceNumber));
  return result[0] || null;
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return (result as any).insertId || 0;
}

export async function updateInvoice(
  invoiceId: number,
  data: Partial<InsertInvoice>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, invoiceId));
}

export async function getOverdueInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db
    .select()
    .from(invoices)
    .innerJoin(units, eq(invoices.unitId, units.id))
    .where(
      and(
        eq(units.userId, userId),
        eq(invoices.status, "overdue"),
        lte(invoices.dueDate, now)
      )
    );
}

// ============= PAYMENTS OPERATIONS =============

export async function getInvoicePayments(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));
}

export async function getUserPayments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(units, eq(invoices.unitId, units.id))
    .where(eq(units.userId, userId))
    .orderBy(desc(payments.paymentDate));
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return (result as any).insertId || 0;
}

export async function getTotalPayments(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select()
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .innerJoin(units, eq(invoices.unitId, units.id))
    .where(eq(units.userId, userId));
  return result.reduce((sum: number, row: any) => sum + row.payments.amount, 0);
}

// ============= ADDITIONAL CHARGES OPERATIONS =============

export async function getInvoiceCharges(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(additionalCharges)
    .where(eq(additionalCharges.invoiceId, invoiceId));
}

export async function getUnitCharges(unitId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(additionalCharges)
    .where(eq(additionalCharges.unitId, unitId))
    .orderBy(desc(additionalCharges.chargeDate));
}

export async function createAdditionalCharge(
  data: InsertAdditionalCharge
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(additionalCharges).values(data);
  return (result as any).insertId || 0;
}

// ============= BACKUP OPERATIONS =============

export async function getUserBackups(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(backups)
    .where(eq(backups.userId, userId))
    .orderBy(desc(backups.createdAt));
}

export async function createBackup(data: InsertBackup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(backups).values(data);
  return (result as any).insertId || 0;
}

export async function getBackupById(backupId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(backups).where(eq(backups.id, backupId));
  return result[0] || null;
}

export async function deleteBackup(backupId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(backups).where(eq(backups.id, backupId));
}

// ============= STATISTICS OPERATIONS =============

export async function getUserStatistics(userId: number) {
  const db = await getDb();
  if (!db)
    return {
      totalUnits: 0,
      totalMeters: 0,
      totalInvoices: 0,
      totalPaid: 0,
      totalPending: 0,
    };

  const userUnits = await db
    .select()
    .from(units)
    .where(eq(units.userId, userId));

  const unitIds = userUnits.map((u: any) => u.id);

  if (unitIds.length === 0) {
    return {
      totalUnits: 0,
      totalMeters: 0,
      totalInvoices: 0,
      totalPaid: 0,
      totalPending: 0,
    };
  }

  const userMeters = await db
    .select()
    .from(meters);

  const userInvoices = await db
    .select()
    .from(invoices);

  const filteredMeters = userMeters.filter((m: any) => unitIds.includes(m.unitId));
  const filteredInvoices = userInvoices.filter((inv: any) => unitIds.includes(inv.unitId));

  const paidInvoices = filteredInvoices.filter((inv: any) => inv.status === "paid");
  const pendingInvoices = filteredInvoices.filter(
    (inv: any) => inv.status === "issued" || inv.status === "overdue"
  );

  const totalPaid = paidInvoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
  const totalPending = pendingInvoices.reduce(
    (sum: number, inv: any) => sum + inv.totalAmount,
    0
  );

  return {
    totalUnits: userUnits.length,
    totalMeters: filteredMeters.length,
    totalInvoices: filteredInvoices.length,
    totalPaid,
    totalPending,
  };
}

// ============= USER OPERATIONS =============

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId));
  return result[0] || null;
}

export async function upsertUser(data: Partial<InsertUser> & { openId: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserByOpenId(data.openId);
  if (existing) {
    await db.update(users).set(data).where(eq(users.openId, data.openId));
    return existing.id;
  } else {
    const result = await db.insert(users).values(data as InsertUser);
    return (result as any).insertId || 0;
  }
}
