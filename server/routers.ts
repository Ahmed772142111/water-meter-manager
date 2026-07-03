import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // Health check
  health: publicProcedure.query(() => ({ status: "ok" })),

  // ============= UNITS ROUTES =============
  units: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getUserUnits(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getUnitById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          unitNumber: z.string().min(1),
          location: z.string().optional(),
          area: z.number().optional(),
          tenantName: z.string().optional(),
          tenantPhone: z.string().optional(),
          tenantEmail: z.string().email().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        return db.createUnit({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          unitNumber: z.string().optional(),
          location: z.string().optional(),
          area: z.number().optional(),
          tenantName: z.string().optional(),
          tenantPhone: z.string().optional(),
          tenantEmail: z.string().optional(),
          status: z.enum(["active", "inactive", "vacant"]).optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateUnit(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return db.deleteUnit(input.id);
      }),
  }),

  // ============= METERS ROUTES =============
  meters: router({
    listByUnit: protectedProcedure
      .input(z.object({ unitId: z.number() }))
      .query(({ input }) => {
        return db.getUnitMeters(input.unitId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getMeterById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          unitId: z.number(),
          meterNumber: z.string().min(1),
          meterType: z.string().default("water"),
          installationDate: z.date().optional(),
        })
      )
      .mutation(({ input }) => {
        return db.createMeter(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          meterNumber: z.string().optional(),
          status: z.enum(["active", "inactive", "faulty"]).optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateMeter(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return db.deleteMeter(input.id);
      }),
  }),

  // ============= METER READINGS ROUTES =============
  readings: router({
    listByMeter: protectedProcedure
      .input(z.object({ meterId: z.number(), limit: z.number().default(12) }))
      .query(({ input }) => {
        return db.getMeterReadings(input.meterId, input.limit);
      }),

    getLatest: protectedProcedure
      .input(z.object({ meterId: z.number() }))
      .query(({ input }) => {
        return db.getLatestMeterReading(input.meterId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          meterId: z.number(),
          reading: z.number().min(0),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const latestReading = await db.getLatestMeterReading(input.meterId);
        const consumption = latestReading
          ? input.reading - latestReading.reading
          : input.reading;

        const readingId = await db.createMeterReading({
          meterId: input.meterId,
          reading: input.reading,
          consumption: consumption > 0 ? consumption : 0,
          notes: input.notes,
        });

        // Update meter's last reading
        await db.updateMeter(input.meterId, {
          lastReading: input.reading,
          lastReadingDate: new Date(),
        });

        return readingId;
      }),
  }),

  // ============= INVOICES ROUTES =============
  invoices: router({
    listByUser: protectedProcedure.query(({ ctx }) => {
      return db.getUserInvoices(ctx.user.id);
    }),

    listByUnit: protectedProcedure
      .input(z.object({ unitId: z.number() }))
      .query(({ input }) => {
        return db.getUnitInvoices(input.unitId);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => {
        return db.getInvoiceById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          unitId: z.number(),
          periodStart: z.date(),
          periodEnd: z.date(),
          consumption: z.number().min(0),
          baseAmount: z.number().min(0),
          additionalCharges: z.number().default(0),
          dueDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const invoiceNumber = `INV-${Date.now()}`;
        const totalAmount = input.baseAmount + input.additionalCharges;

        return db.createInvoice({
          unitId: input.unitId,
          invoiceNumber,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          consumption: input.consumption,
          baseAmount: input.baseAmount,
          additionalCharges: input.additionalCharges,
          totalAmount,
          dueDate: input.dueDate,
          status: "issued",
          notes: input.notes,
        });
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "issued", "paid", "overdue", "cancelled"]),
          paidDate: z.date().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateInvoice(id, data);
      }),

    getOverdue: protectedProcedure.query(({ ctx }) => {
      return db.getOverdueInvoices(ctx.user.id);
    }),
  }),

  // ============= PAYMENTS ROUTES =============
  payments: router({
    listByInvoice: protectedProcedure
      .input(z.object({ invoiceId: z.number() }))
      .query(({ input }) => {
        return db.getInvoicePayments(input.invoiceId);
      }),

    listByUser: protectedProcedure.query(({ ctx }) => {
      return db.getUserPayments(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          invoiceId: z.number(),
          amount: z.number().min(0),
          paymentMethod: z.string().default("cash"),
          reference: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const paymentId = await db.createPayment({
          invoiceId: input.invoiceId,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          reference: input.reference,
          notes: input.notes,
        });

        // Check if invoice is fully paid
        const invoice = await db.getInvoiceById(input.invoiceId);
        if (invoice) {
          const payments = await db.getInvoicePayments(input.invoiceId);
          const totalPaid = payments.reduce(
            (sum: number, p: any) => sum + p.amount,
            0
          );

          if (totalPaid >= invoice.totalAmount) {
            await db.updateInvoice(input.invoiceId, {
              status: "paid",
              paidDate: new Date(),
            });
          }
        }

        return paymentId;
      }),
  }),

  // ============= STATISTICS ROUTES =============
  statistics: router({
    getUserStats: protectedProcedure.query(({ ctx }) => {
      return db.getUserStatistics(ctx.user.id);
    }),
  }),

  // ============= BACKUP ROUTES =============
  backups: router({
    list: protectedProcedure.query(({ ctx }) => {
      return db.getUserBackups(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ backupName: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const units = await db.getUserUnits(ctx.user.id);
        const backupData = JSON.stringify({ units, timestamp: new Date() });

        return db.createBackup({
          userId: ctx.user.id,
          backupName: input.backupName,
          backupData,
          backupSize: backupData.length,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        return db.deleteBackup(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
