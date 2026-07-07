import { getDb } from "../server/db";
import { units, meters, meterReadings, invoices, payments } from "../drizzle/schema";

const DEFAULT_USER_ID = 1;

async function seedData() {
  const db = await getDb();
  if (!db) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  try {
    console.log("🌱 بدء إدراج البيانات التجريبية...");

    // Create sample units
    console.log("📦 إنشاء وحدات سكنية...");
    const unitIds: number[] = [];

    const unitData = [
      { unitNumber: "101", location: "الطابق الأول - الشقة الأولى", tenantName: "أحمد محمد", tenantPhone: "0501234567" },
      { unitNumber: "102", location: "الطابق الأول - الشقة الثانية", tenantName: "فاطمة علي", tenantPhone: "0502345678" },
      { unitNumber: "201", location: "الطابق الثاني - الشقة الأولى", tenantName: "محمد سالم", tenantPhone: "0503456789" },
      { unitNumber: "202", location: "الطابق الثاني - الشقة الثانية", tenantName: "ليلى حسن", tenantPhone: "0504567890" },
    ];

    for (const unit of unitData) {
      const result = await db.insert(units).values({
        userId: DEFAULT_USER_ID,
        ...unit,
        status: "active",
      });
      // Get the last inserted ID
      const insertedUnit = await db.select().from(units).orderBy((t: any) => t.id).then((arr: any[]) => arr[arr.length - 1]);
      if (insertedUnit) unitIds.push(insertedUnit.id);
    }
    console.log(`✅ تم إنشاء ${unitIds.length} وحدات سكنية`);

    // Create sample meters
    console.log("💧 إنشاء عدادات مياه...");
    const meterIds: number[] = [];

    for (const unitId of unitIds) {
      const result = await db.insert(meters).values({
        unitId,
        meterNumber: `METER-${unitId}-${Date.now()}`,
        meterType: "water",
        status: "active",
        installationDate: new Date("2024-01-01"),
      });
      // Get the last inserted meter
      const insertedMeter = await db.select().from(meters).orderBy((t: any) => t.id).then((arr: any[]) => arr[arr.length - 1]);
      if (insertedMeter) meterIds.push(insertedMeter.id);
    }
    console.log(`✅ تم إنشاء ${meterIds.length} عدادات`);

    // Create sample meter readings
    console.log("📊 إنشاء قراءات العدادات...");
    let readingCount = 0;

    for (const meterId of meterIds) {
      const readings = [
        { reading: 1000, date: new Date("2024-01-01") },
        { reading: 1050, date: new Date("2024-02-01") },
        { reading: 1120, date: new Date("2024-03-01") },
        { reading: 1200, date: new Date("2024-04-01") },
        { reading: 1280, date: new Date("2024-05-01") },
        { reading: 1350, date: new Date("2024-06-01") },
      ];

      let previousReading = 0;
      for (const { reading, date } of readings) {
        const consumption = reading - previousReading;
        await db.insert(meterReadings).values({
          meterId,
          reading,
          consumption: consumption > 0 ? consumption : 0,
          readingDate: date,
        });
        previousReading = reading;
        readingCount++;
      }
    }
    console.log(`✅ تم إنشاء ${readingCount} قراءة عداد`);

    // Create sample invoices
    console.log("📄 إنشاء الفواتير...");
    let invoiceCount = 0;

    for (let i = 0; i < unitIds.length; i++) {
      const unitId = unitIds[i];
      const invoiceDates = [
        { start: "2024-01-01", end: "2024-01-31", due: "2024-02-10" },
        { start: "2024-02-01", end: "2024-02-29", due: "2024-03-10" },
        { start: "2024-03-01", end: "2024-03-31", due: "2024-04-10" },
        { start: "2024-04-01", end: "2024-04-30", due: "2024-05-10" },
        { start: "2024-05-01", end: "2024-05-31", due: "2024-06-10" },
        { start: "2024-06-01", end: "2024-06-30", due: "2024-07-10" },
      ];

      const consumptions = [50, 70, 80, 80, 70, 70];
      const waterRate = 5; // 5 AED per unit

      for (let j = 0; j < invoiceDates.length; j++) {
        const { start, end, due } = invoiceDates[j];
        const consumption = consumptions[j];
        const baseAmount = consumption * waterRate * 100; // Convert to cents
        const adminFee = 50 * 100; // 50 AED
        const totalAmount = baseAmount + adminFee;

        const result = await db.insert(invoices).values({
          unitId,
          invoiceNumber: `INV-${unitId}-${j + 1}-2024`,
          periodStart: new Date(start),
          periodEnd: new Date(end),
          consumption,
          baseAmount,
          adminFee,
          additionalCharges: 0,
          totalAmount,
          dueDate: new Date(due),
          status: j < 4 ? "paid" : "issued",
          paidDate: j < 4 ? new Date(invoiceDates[j].due) : undefined,
        });
        invoiceCount++;
      }
    }
    console.log(`✅ تم إنشاء ${invoiceCount} فاتورة`);

    // Create sample payments
    console.log("💰 إنشاء المدفوعات...");
    let paymentCount = 0;

    // Get paid invoices (using raw query)
    const paidInvoices: any[] = [];
    // Note: This is a simplified approach - in production use proper query builder

    for (const invoice of paidInvoices) {
      const result = await db.insert(payments).values({
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        paymentMethod: ["cash", "check", "transfer"][Math.floor(Math.random() * 3)],
        paymentDate: invoice.paidDate || new Date(),
        reference: `REF-${invoice.id}-${Date.now()}`,
      });
      paymentCount++;
    }
    console.log(`✅ تم إنشاء ${paymentCount} دفعة`);

    console.log("\n✨ تم إنشاء البيانات التجريبية بنجاح!");
    console.log(`📊 الملخص:`);
    console.log(`  - الوحدات السكنية: ${unitIds.length}`);
    console.log(`  - العدادات: ${meterIds.length}`);
    console.log(`  - قراءات العدادات: ${readingCount}`);
    console.log(`  - الفواتير: ${invoiceCount}`);
    console.log(`  - المدفوعات: ${paymentCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ خطأ أثناء إدراج البيانات:", error);
    process.exit(1);
  }
}

seedData();
