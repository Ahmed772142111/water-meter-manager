import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ReportsScreen() {
  const colors = useColors();
  const [reportType, setReportType] = useState("monthly");

  const { data: invoices } = trpc.invoices.listByUser.useQuery();
  const { data: payments } = trpc.payments.listByUser.useQuery();

  // Calculate monthly data
  const monthlyData = invoices
    ? Array.from({ length: 12 }, (_, i) => {
        const month = new Date(new Date().getFullYear(), i, 1);
        const invoicesThisMonth = invoices.filter((inv: any) => {
          const invDate = new Date(inv.issuedDate);
          return invDate.getMonth() === i && invDate.getFullYear() === new Date().getFullYear();
        });
        return {
          month: month.toLocaleDateString("ar-SA", { month: "short" }),
          issued: invoicesThisMonth.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) / 100,
          paid: invoicesThisMonth
            .filter((inv: any) => inv.status === "paid")
            .reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) / 100,
        };
      })
    : [];

  // Calculate status distribution
  const statusData = invoices
    ? {
        paid: invoices.filter((inv: any) => inv.status === "paid").length,
        issued: invoices.filter((inv: any) => inv.status === "issued").length,
        overdue: invoices.filter((inv: any) => inv.status === "overdue").length,
      }
    : { paid: 0, issued: 0, overdue: 0 };

  // Calculate totals
  const totals = {
    totalIssued: invoices?.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) || 0,
    totalPaid: invoices?.filter((inv: any) => inv.status === "paid").reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) || 0,
    totalOutstanding: invoices?.filter((inv: any) => inv.status !== "paid").reduce((sum: number, inv: any) => sum + inv.totalAmount, 0) || 0,
  };

  const StatBox = ({ label, value, color }: any) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginRight: 8,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>
        {value}
      </Text>
    </View>
  );

  const SimpleBarChart = ({ data, label }: any) => {
    const maxValue = Math.max(...data.map((d: any) => Math.max(d.issued, d.paid)));
    return (
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
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
          {label}
        </Text>

        <View style={{ height: 200, justifyContent: "flex-end", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", height: 150, gap: 4 }}>
            {data.slice(0, 6).map((item: any, index: number) => (
              <View key={index} style={{ flex: 1, alignItems: "center" }}>
                <View style={{ flexDirection: "row", height: 120, alignItems: "flex-end", gap: 2 }}>
                  <View
                    style={{
                      width: "45%",
                      height: maxValue > 0 ? (item.issued / maxValue) * 120 : 0,
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: "45%",
                      height: maxValue > 0 ? (item.paid / maxValue) * 120 : 0,
                      backgroundColor: colors.success,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 8 }}>
                  {item.month}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 16, justifyContent: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.primary,
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, color: colors.muted }}>مصدرة</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: colors.success,
                borderRadius: 2,
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: 12, color: colors.muted }}>مسددة</Text>
          </View>
        </View>
      </View>
    );
  };

  const StatusPie = () => {
    const total = statusData.paid + statusData.issued + statusData.overdue;
    if (total === 0) return null;

    const paidPercent = (statusData.paid / total) * 100;
    const issuedPercent = (statusData.issued / total) * 100;
    const overduePercent = (statusData.overdue / total) * 100;

    return (
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
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 16 }}>
          توزيع حالة الفواتير
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, height: 40 }}>
          <View
            style={{
              flex: paidPercent,
              backgroundColor: colors.success,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              flex: issuedPercent,
              backgroundColor: colors.warning,
              borderRadius: 4,
            }}
          />
          <View
            style={{
              flex: overduePercent,
              backgroundColor: colors.error,
              borderRadius: 4,
            }}
          />
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors.success,
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.muted }}>مسددة</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              {statusData.paid} ({paidPercent.toFixed(1)}%)
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors.warning,
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.muted }}>مصدرة</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              {statusData.issued} ({issuedPercent.toFixed(1)}%)
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: colors.error,
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.muted }}>متأخرة</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
              {statusData.overdue} ({overduePercent.toFixed(1)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            التقارير المالية
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <StatBox
              label="إجمالي المصدر"
              value={`${(totals.totalIssued / 100).toFixed(2)} د.إ`}
              color={colors.primary}
            />
            <StatBox
              label="إجمالي المسدد"
              value={`${(totals.totalPaid / 100).toFixed(2)} د.إ`}
              color={colors.success}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <StatBox
              label="المستحق"
              value={`${(totals.totalOutstanding / 100).toFixed(2)} د.إ`}
              color={colors.error}
            />
            <StatBox
              label="معدل التحصيل"
              value={`${totals.totalIssued > 0 ? ((totals.totalPaid / totals.totalIssued) * 100).toFixed(1) : 0}%`}
              color={colors.warning}
            />
          </View>
        </View>

        {/* Report Type Selector */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {[
            { label: "شهري", value: "monthly" },
            { label: "ربع سنوي", value: "quarterly" },
            { label: "سنوي", value: "yearly" },
          ].map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setReportType(type.value)}
              style={{
                flex: 1,
                backgroundColor: reportType === type.value ? colors.primary : colors.surface,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: reportType === type.value ? "white" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Charts */}
        <SimpleBarChart data={monthlyData} label="الفواتير المصدرة والمسددة" />
        <StatusPie />

        {/* Export Button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="download" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600", marginLeft: 8 }}>
            تحميل التقرير
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
