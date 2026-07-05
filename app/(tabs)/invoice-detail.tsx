import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Share, Alert, TextInput, Modal } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function InvoiceDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery(
    { id: parseInt(id as string) || 0 },
    { enabled: !!id }
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // In a real app, you would generate PDF here
      Alert.alert("نجح", "تم تحميل الفاتورة كـ PDF");
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء تحميل الفاتورة");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `فاتورة #${invoice?.invoiceNumber}\nالمبلغ: ${(invoice?.totalAmount || 0) / 100} د.إ`,
        title: `فاتورة #${invoice?.invoiceNumber}`,
      });
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء المشاركة");
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    if (!/^\d{10,}$/.test(phoneNumber.replace(/\D/g, ""))) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
      return;
    }

    setIsSendingSMS(true);
    try {
      const message = `فاتورة #${invoice?.invoiceNumber}\nالمبلغ: ${(invoice?.totalAmount || 0) / 100} د.إ\nتاريخ الاستحقاق: ${new Date(invoice?.dueDate || "").toLocaleDateString("ar-SA")}\nالرجاء السداد قبل التاريخ المذكور أعلاه.`;
      // In a real app, you would send SMS using a service
      Alert.alert("نجح", `تم إرسال الفاتورة إلى ${phoneNumber}`);
      setPhoneNumber("");
      setShowSMSModal(false);
    } catch (error) {
      Alert.alert("خطأ", "حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsSendingSMS(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!invoice) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text style={{ color: colors.muted }}>الفاتورة غير موجودة</Text>
      </ScreenContainer>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "issued":
        return colors.warning;
      case "overdue":
        return colors.error;
      default:
        return colors.border;
    }
  };

  const getStatusLabel = (status: string) => {
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

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
              فاتورة #{invoice.invoiceNumber}
            </Text>
            <View
              style={{
                backgroundColor: getStatusColor(invoice.status),
                borderRadius: 4,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                {getStatusLabel(invoice.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Details Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Unit Information */}
          <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>الوحدة</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              الوحدة {invoice.unitId}
            </Text>
          </View>

          {/* Period Information */}
          <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>الفترة</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                من: {new Date(invoice.periodStart).toLocaleDateString("ar-SA")}
              </Text>
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                إلى: {new Date(invoice.periodEnd).toLocaleDateString("ar-SA")}
              </Text>
            </View>
          </View>

          {/* Consumption */}
          <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>الاستهلاك</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>الاستهلاك:</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {invoice.consumption} وحدة
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>السعر للوحدة:</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {((invoice.baseAmount / invoice.consumption) / 100).toFixed(2)} د.إ
              </Text>
            </View>
          </View>

          {/* Amount Details */}
          <View style={{ marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>تفاصيل المبلغ</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>المبلغ الأساسي:</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {(invoice.baseAmount / 100).toFixed(2)} د.إ
              </Text>
            </View>
            {invoice.additionalCharges > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>رسوم إضافية:</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.warning }}>
                  {(invoice.additionalCharges / 100).toFixed(2)} د.إ
                </Text>
              </View>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>الإجمالي:</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                {(invoice.totalAmount / 100).toFixed(2)} د.إ
              </Text>
            </View>
          </View>

          {/* Dates */}
          <View>
            {invoice.issuedDate && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ الإصدار:</Text>
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                  {new Date(invoice.issuedDate).toLocaleDateString("ar-SA")}
                </Text>
              </View>
            )}
            {invoice.dueDate && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ الاستحقاق:</Text>
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                  {new Date(invoice.dueDate).toLocaleDateString("ar-SA")}
                </Text>
              </View>
            )}
            {invoice.paidDate && (
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ الدفع:</Text>
                <Text style={{ fontSize: 12, color: colors.success }}>
                  {new Date(invoice.paidDate).toLocaleDateString("ar-SA")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleExportPDF}
            disabled={isExporting}
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="download" size={18} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
              {isExporting ? "جاري..." : "تحميل PDF"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSMSModal(true)}
            style={{
              flex: 1,
              backgroundColor: colors.success,
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="mail" size={18} color="white" />
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
              إرسال SMS
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,
              backgroundColor: colors.border,
              borderRadius: 12,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="share-social" size={18} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
              مشاركة
            </Text>
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        {invoice.status !== "paid" && (
          <View
            style={{
              backgroundColor: colors.warning,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
              المبلغ المستحق
            </Text>
            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
              {(invoice.totalAmount / 100).toFixed(2)} د.إ
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderRadius: 8,
                padding: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.warning, fontWeight: "600", fontSize: 14 }}>
                تسجيل دفع
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notes Section */}
        {invoice.notes && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              ملاحظات
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
              {invoice.notes}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SMS Modal */}
      <Modal
        visible={showSMSModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSMSModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>
                إرسال الفاتورة عبر SMS
              </Text>
              <TouchableOpacity onPress={() => setShowSMSModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Phone Input */}
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
              رقم الهاتف
            </Text>
            <TextInput
              placeholder="أدخل رقم الهاتف"
              placeholderTextColor={colors.muted}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            {/* Message Preview */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                معاينة الرسالة
              </Text>
              <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20 }}>
                فاتورة #{invoice?.invoiceNumber}{"\n"}
                المبلغ: {(invoice?.totalAmount || 0) / 100} د.إ{"\n"}
                تاريخ الاستحقاق: {new Date(invoice?.dueDate || "").toLocaleDateString("ar-SA")}{"\n"}
                الرجاء السداد قبل التاريخ المذكور أعلاه.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowSMSModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.border,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendSMS}
                disabled={isSendingSMS}
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                  opacity: isSendingSMS ? 0.5 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                  {isSendingSMS ? "جاري..." : "إرسال"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
