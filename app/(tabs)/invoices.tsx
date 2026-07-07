import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function InvoicesScreen() {
  const colors = useColors();
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: invoices, isLoading } = trpc.invoices.listByUser.useQuery();
  const { data: overdueInvoices } = trpc.invoices.getOverdue.useQuery();

  const filteredInvoices = invoices?.filter((inv: any) => {
    if (filterStatus === "all") return true;
    return inv.status === filterStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "issued":
        return colors.warning;
      case "overdue":
        return colors.error;
      case "draft":
        return colors.muted;
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
      case "draft":
        return "مسودة";
      case "cancelled":
        return "ملغاة";
      default:
        return status;
    }
  };

  const InvoiceCard = ({ invoice }: { invoice: any }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: getStatusColor(invoice.status),
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            فاتورة #{invoice.invoiceNumber}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            الوحدة: {invoice.unitId}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: getStatusColor(invoice.status),
            borderRadius: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
            {getStatusLabel(invoice.status)}
          </Text>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>الفترة:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
            {new Date(invoice.periodStart).toLocaleDateString("ar-SA")} - {new Date(invoice.periodEnd).toLocaleDateString("ar-SA")}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>الاستهلاك:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
            {invoice.consumption} وحدة
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>المبلغ الأساسي:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
            {(invoice.baseAmount / 100).toFixed(2)} د.إ
          </Text>
        </View>

        {invoice.additionalCharges > 0 && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>رسوم إضافية:</Text>
            <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "500" }}>
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>الإجمالي:</Text>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
            {(invoice.totalAmount / 100).toFixed(2)} د.إ
          </Text>
        </View>

        {invoice.dueDate && (
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
            تاريخ الاستحقاق: {new Date(invoice.dueDate).toLocaleDateString("ar-SA")}
          </Text>
        )}
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>عرض التفاصيل</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: colors.border,
            borderRadius: 8,
            padding: 10,
            alignItems: "center",
          }}
        >
          <Ionicons name="download" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filterButtons = [
    { label: "الكل", value: "all" },
    { label: "مسددة", value: "paid" },
    { label: "مصدرة", value: "issued" },
    { label: "متأخرة", value: "overdue" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            الفواتير
          </Text>
        </View>

        {/* Overdue Alert */}
        {overdueInvoices && overdueInvoices.length > 0 && (
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

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.value}
              onPress={() => setFilterStatus(btn.value)}
              style={{
                backgroundColor: filterStatus === btn.value ? colors.primary : colors.surface,
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
                  color: filterStatus === btn.value ? "white" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Invoices List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : filteredInvoices.length > 0 ? (
          <FlatList
            data={filteredInvoices}
            keyExtractor={(item: any) => item?.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => <InvoiceCard invoice={item} />}
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
              لا توجد فواتير بهذه الحالة
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
