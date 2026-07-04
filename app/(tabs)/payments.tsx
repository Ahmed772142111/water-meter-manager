import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function PaymentsScreen() {
  const colors = useColors();
  const [filterPeriod, setFilterPeriod] = useState("month");

  const { data: recentPayments, isLoading } = trpc.payments.listByUser.useQuery();
  
  // Calculate stats from recent payments
  const stats = recentPayments ? {
    totalOutstanding: recentPayments.reduce((sum: number, p: any) => sum + (p.invoiceId ? 0 : 0), 0),
    totalPaid: recentPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
    monthlyPayments: recentPayments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum: number, p: any) => sum + p.amount, 0),
  } : { totalOutstanding: 0, totalPaid: 0, monthlyPayments: 0 };
  const { data: invoices } = trpc.invoices.listByUser.useQuery();
  const overdueInvoices = invoices?.filter((inv: any) => inv.status === "overdue") || [];

  const StatCard = ({ label, value, icon, color }: any) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: color,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground }}>
          {value}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: color,
          borderRadius: 8,
          padding: 12,
          opacity: 0.1,
        }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
    </View>
  );

  const PaymentCard = ({ payment }: { payment: any }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            فاتورة #{payment.invoiceNumber}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            الوحدة: {payment.unitId}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.success,
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
            مسددة
          </Text>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>المبلغ المدفوع:</Text>
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.success }}>
            {(payment.amount / 100).toFixed(2)} د.إ
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>طريقة الدفع:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground }}>
            {payment.paymentMethod === "cash"
              ? "نقد"
              : payment.paymentMethod === "bank_transfer"
                ? "تحويل بنكي"
                : payment.paymentMethod === "check"
                  ? "شيك"
                  : "بطاقة ائتمان"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ الدفع:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground }}>
            {new Date(payment.paymentDate).toLocaleDateString("ar-SA")}
          </Text>
        </View>
      </View>

      {payment.notes && (
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 11, color: colors.muted, fontStyle: "italic" }}>
            {payment.notes}
          </Text>
        </View>
      )}
    </View>
  );

  const periodButtons = [
    { label: "هذا الشهر", value: "month" },
    { label: "هذا الربع", value: "quarter" },
    { label: "هذه السنة", value: "year" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            تتبع المدفوعات
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={{ marginBottom: 20 }}>
          <StatCard
            label="إجمالي المستحقات"
            value={`${((stats?.totalOutstanding || 0) / 100).toFixed(2)} د.إ`}
            icon="wallet"
            color={colors.error}
          />
          <StatCard
            label="إجمالي المدفوع"
            value={`${((stats?.totalPaid || 0) / 100).toFixed(2)} د.إ`}
            icon="checkmark-circle"
            color={colors.success}
          />
          <StatCard
            label="المدفوعات هذا الشهر"
            value={`${((stats?.monthlyPayments || 0) / 100).toFixed(2)} د.إ`}
            icon="calendar"
            color={colors.primary}
          />
        </View>

        {/* Overdue Alert */}
        {overdueInvoices.length > 0 && (
          <View
            style={{
              backgroundColor: colors.error,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Ionicons name="alert-circle" size={24} color="white" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: "white", fontWeight: "600", marginBottom: 4 }}>
                فواتير متأخرة
              </Text>
              <Text style={{ color: "white", fontSize: 12 }}>
                لديك {overdueInvoices.length} فاتورة متأخرة عن السداد
              </Text>
            </View>
          </View>
        )}

        {/* Period Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {periodButtons.map((btn) => (
            <TouchableOpacity
              key={btn.value}
              onPress={() => setFilterPeriod(btn.value)}
              style={{
                backgroundColor: filterPeriod === btn.value ? colors.primary : colors.surface,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: filterPeriod === btn.value ? "white" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Action Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 14,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
            تسجيل دفع جديد
          </Text>
        </TouchableOpacity>

        {/* Recent Payments */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            المدفوعات الأخيرة
          </Text>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : recentPayments && recentPayments.length > 0 ? (
            <FlatList
              data={recentPayments}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={({ item }) => <PaymentCard payment={item} />}
              scrollEnabled={false}
            />
          ) : (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 24,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
                لا توجد مدفوعات مسجلة
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
