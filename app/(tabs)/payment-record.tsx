import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentRecordScreen() {
  const colors = useColors();
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "cash",
    notes: "",
  });

  const { data: invoices } = trpc.invoices.listByUser.useQuery();
  const { mutate: recordPayment, isPending } = trpc.payments.create.useMutation({
    onSuccess: () => {
      Alert.alert("نجح", "تم تسجيل الدفع بنجاح");
      setFormData({ amount: "", paymentMethod: "cash", notes: "" });
      setSelectedInvoice("");
    },
    onError: (error) => {
      Alert.alert("خطأ", error.message || "حدث خطأ أثناء تسجيل الدفع");
    },
  });

  const selectedInvoiceData = invoices?.find((inv: any) => inv.id.toString() === selectedInvoice);

  const handleRecordPayment = () => {
    if (!selectedInvoice || !formData.amount.trim()) {
      Alert.alert("خطأ", "يرجى اختيار فاتورة وإدخال المبلغ");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }

    if (amount > (selectedInvoiceData?.totalAmount || 0) / 100) {
      Alert.alert("خطأ", "المبلغ المدفوع أكثر من المستحق");
      return;
    }

    recordPayment({
      invoiceId: parseInt(selectedInvoice),
      amount: Math.round(amount * 100),
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    });
  };

  const pendingInvoices = invoices?.filter((inv: any) => inv.status !== "paid") || [];

  const paymentMethods = [
    { label: "نقد", value: "cash" },
    { label: "تحويل بنكي", value: "bank_transfer" },
    { label: "شيك", value: "check" },
    { label: "بطاقة ائتمان", value: "credit_card" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            تسجيل دفع
          </Text>
        </View>

        {/* Invoice Selection */}
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            اختر الفاتورة
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {pendingInvoices.map((invoice: any) => (
              <TouchableOpacity
                key={invoice.id}
                onPress={() => setSelectedInvoice(invoice.id.toString())}
                style={{
                  backgroundColor: selectedInvoice === invoice.id.toString() ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 8,
                  minWidth: 120,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: selectedInvoice === invoice.id.toString() ? "white" : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  فاتورة #{invoice.invoiceNumber}
                </Text>
                <Text
                  style={{
                    color: selectedInvoice === invoice.id.toString() ? "white" : colors.muted,
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {(invoice.totalAmount / 100).toFixed(2)} د.إ
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Invoice Details */}
        {selectedInvoiceData && (
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
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              تفاصيل الفاتورة
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>رقم الفاتورة:</Text>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
                #{selectedInvoiceData.invoiceNumber}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>الوحدة:</Text>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
                الوحدة {selectedInvoiceData.unitId}
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>المبلغ المستحق:</Text>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>
                {(selectedInvoiceData.totalAmount / 100).toFixed(2)} د.إ
              </Text>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ الاستحقاق:</Text>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
                {new Date(selectedInvoiceData.dueDate).toLocaleDateString("ar-SA")}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Amount */}
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            المبلغ المدفوع
          </Text>

          <TextInput
            placeholder="أدخل المبلغ"
            placeholderTextColor={colors.muted}
            value={formData.amount}
            onChangeText={(text) => setFormData({ ...formData, amount: text })}
            keyboardType="decimal-pad"
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 14,
            }}
          />

          {selectedInvoiceData && formData.amount && (
            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>المبلغ المستحق:</Text>
                <Text style={{ fontSize: 12, color: colors.foreground }}>
                  {(selectedInvoiceData.totalAmount / 100).toFixed(2)} د.إ
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: colors.muted }}>الرصيد المتبقي:</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      parseFloat(formData.amount) > (selectedInvoiceData.totalAmount / 100)
                        ? colors.error
                        : colors.success,
                    fontWeight: "600",
                  }}
                >
                  {(
                    (selectedInvoiceData.totalAmount / 100) - parseFloat(formData.amount || "0")
                  ).toFixed(2)}{" "}
                  د.إ
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Method */}
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            طريقة الدفع
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => setFormData({ ...formData, paymentMethod: method.value })}
                style={{
                  backgroundColor: formData.paymentMethod === method.value ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flex: 1,
                  minWidth: "45%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: formData.paymentMethod === method.value ? "white" : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            ملاحظات (اختياري)
          </Text>

          <TextInput
            placeholder="أضف ملاحظات عن الدفع"
            placeholderTextColor={colors.muted}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              padding: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleRecordPayment}
            disabled={isPending || !selectedInvoice || !formData.amount}
            style={{
              flex: 1,
              backgroundColor: colors.success,
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              opacity: isPending || !selectedInvoice || !formData.amount ? 0.5 : 1,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="white" />
                <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginTop: 4 }}>
                  تسجيل الدفع
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.border,
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Ionicons name="close-circle" size={18} color={colors.foreground} />
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginTop: 4 }}>
              إلغاء
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
