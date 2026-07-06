import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface InvoiceData {
  invoiceNumber: string;
  unitName: string;
  tenantName: string;
  month: string;
  year: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  waterRate: number;
  baseAmount: number;
  adminFee: number;
  lateFee: number;
  additionalCharges: number;
  totalAmount: number;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "issued" | "overdue";
  notes?: string;
}

const getStatusText = (status: string): string => {
  switch (status) {
    case "paid":
      return "مسددة";
    case "issued":
      return "مصدرة";
    case "overdue":
      return "متأخرة";
    default:
      return status;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA");
};

const generateInvoiceHTML = (data: InvoiceData): string => {
  const formatCurrency = (amount: number): string => {
    return (amount / 100).toFixed(2);
  };

  const adminFeeRow =
    data.adminFee > 0
      ? `<tr>
                <td style="text-align: right;">الرسم الإداري</td>
                <td style="text-align: left;">${formatCurrency(data.adminFee)}</td>
              </tr>`
      : "";

  const lateFeeRow =
    data.lateFee > 0
      ? `<tr>
                <td style="text-align: right;">رسم التأخير</td>
                <td style="text-align: left;">${formatCurrency(data.lateFee)}</td>
              </tr>`
      : "";

  const additionalChargesRow =
    data.additionalCharges > 0
      ? `<tr>
                <td style="text-align: right;">رسوم إضافية</td>
                <td style="text-align: left;">${formatCurrency(data.additionalCharges)}</td>
              </tr>`
      : "";

  const paidDateRow = data.paidDate
    ? `<div class="info-row">
            <span class="info-label">تاريخ الدفع:</span>
            <span class="info-value">${formatDate(data.paidDate)}</span>
          </div>`
    : "";

  const notesSection = data.notes
    ? `<div class="section">
          <div class="section-title">ملاحظات</div>
          <div class="notes">${data.notes}</div>
        </div>`
    : "";

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة المياه</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background: white;
          padding: 20px;
          direction: rtl;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
          color: #666;
          margin: 3px 0;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 11px;
        }
        .info-label {
          font-weight: bold;
          width: 40%;
        }
        .info-value {
          text-align: left;
          width: 60%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 10px;
        }
        thead {
          background-color: #f0f0f0;
          border-bottom: 2px solid #000;
        }
        th {
          padding: 8px 5px;
          font-weight: bold;
          text-align: center;
        }
        td {
          padding: 8px 5px;
          border-bottom: 1px solid #ddd;
          text-align: center;
        }
        .total-section {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: bold;
        }
        .total-label {
          width: 60%;
          text-align: right;
        }
        .total-value {
          width: 40%;
          text-align: left;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          text-align: center;
          font-size: 9px;
          color: #666;
        }
        .notes {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 4px;
          font-size: 10px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>فاتورة المياه</h1>
          <p>رقم الفاتورة: ${data.invoiceNumber}</p>
          <p>الحالة: ${getStatusText(data.status)}</p>
        </div>

        <div class="section">
          <div class="section-title">معلومات الفاتورة</div>
          <div class="info-row">
            <span class="info-label">الوحدة:</span>
            <span class="info-value">${data.unitName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">اسم المستأجر:</span>
            <span class="info-value">${data.tenantName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الشهر:</span>
            <span class="info-value">${data.month}/${data.year}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ الإصدار:</span>
            <span class="info-value">${formatDate(data.issuedDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاريخ الاستحقاق:</span>
            <span class="info-value">${formatDate(data.dueDate)}</span>
          </div>
          ${paidDateRow}
        </div>

        <div class="section">
          <div class="section-title">قراءة العداد</div>
          <div class="info-row">
            <span class="info-label">القراءة السابقة:</span>
            <span class="info-value">${data.previousReading}</span>
          </div>
          <div class="info-row">
            <span class="info-label">القراءة الحالية:</span>
            <span class="info-value">${data.currentReading}</span>
          </div>
          <div class="info-row">
            <span class="info-label">الاستهلاك:</span>
            <span class="info-value">${data.consumption} وحدة</span>
          </div>
          <div class="info-row">
            <span class="info-label">سعر الوحدة:</span>
            <span class="info-value">${data.waterRate.toFixed(2)} د.إ</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">تفاصيل المبلغ</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: right; width: 70%;">البيان</th>
                <th style="text-align: left; width: 30%;">المبلغ (د.إ)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: right;">المبلغ الأساسي</td>
                <td style="text-align: left;">${formatCurrency(data.baseAmount)}</td>
              </tr>
              ${adminFeeRow}
              ${lateFeeRow}
              ${additionalChargesRow}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">الإجمالي:</span>
            <span class="total-value">${formatCurrency(data.totalAmount)} د.إ</span>
          </div>
        </div>

        ${notesSection}

        <div class="footer">
          <p>شكراً لك على الدفع في الموعد المحدد</p>
          <p>الرجاء الاحتفاظ بهذه الفاتورة للمراجعة</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateAndShareInvoicePDF = async (
  data: InvoiceData
): Promise<void> => {
  try {
    const htmlContent = generateInvoiceHTML(data);
    const fileName = `invoice_${data.invoiceNumber}_${Date.now()}.html`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, htmlContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "text/html",
        dialogTitle: `فاتورة المياه - ${data.invoiceNumber}`,
      });
    }
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};

export const downloadInvoicePDF = async (data: InvoiceData): Promise<string> => {
  try {
    const htmlContent = generateInvoiceHTML(data);
    const fileName = `invoice_${data.invoiceNumber}_${Date.now()}.html`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, htmlContent);

    return filePath;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
};
