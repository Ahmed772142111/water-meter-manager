import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUnits: 0,
    totalMeters: 0,
    totalInvoices: 0,
    totalPaid: 0,
    totalPending: 0,
  });

  const { data: statsData, isLoading } = trpc.statistics.getUserStats.useQuery();

  useEffect(() => {
    if (statsData) {
      setStats(statsData);
    }
  }, [statsData]);

  const quickActions = [
    {
      id: "add-unit",
      title: "إضافة وحدة",
      icon: "🏠",
      onPress: () => {},
      color: colors.primary,
    },
    {
      id: "add-meter",
      title: "إضافة عداد",
      icon: "💧",
      onPress: () => {},
      color: colors.primary,
    },
    {
      id: "read-meter",
      title: "قراءة عداد",
      icon: "📊",
      onPress: () => {},
      color: colors.success,
    },
    {
      id: "invoices",
      title: "الفواتير",
      icon: "📄",
      onPress: () => {},
      color: colors.warning,
    },
  ];

  const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
    <View
      style={{
        backgroundColor: color,
        borderRadius: 12,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
      }}
    >
      <Text style={{ color: "white", fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
        {label}
      </Text>
      <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
        {value}
      </Text>
    </View>
  );

  const QuickActionButton = ({
    title,
    icon,
    onPress,
    color,
  }: {
    title: string;
    icon: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: color,
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        marginHorizontal: 6,
        marginVertical: 8,
      }}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 28, marginBottom: 4 }}>{icon}</Text>
      <Text style={{ color: "white", fontSize: 12, fontWeight: "600", textAlign: "center" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground, marginBottom: 4 }}>
            مرحباً، {user?.name || "المستخدم"}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            إدارة عدادات المياه والوحدات السكنية
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            الملخص السريع
          </Text>

          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard
              label="الوحدات"
              value={stats.totalUnits}
              color={colors.primary}
            />
            <StatCard
              label="العدادات"
              value={stats.totalMeters}
              color={colors.primary}
            />
          </View>

          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            <StatCard
              label="الفواتير"
              value={stats.totalInvoices}
              color={colors.warning}
            />
            <StatCard
              label="المسدد"
              value={`${Math.round((stats.totalPaid / 100))}د.إ`}
              color={colors.success}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <StatCard
              label="المستحق"
              value={`${Math.round((stats.totalPending / 100))}د.إ`}
              color={colors.error}
            />
            <View style={{ flex: 1, marginHorizontal: 4 }} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            الإجراءات السريعة
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {quickActions.map((action) => (
              <View key={action.id} style={{ width: "48%" }}>
                <QuickActionButton
                  title={action.title}
                  icon={action.icon}
                  onPress={action.onPress}
                  color={action.color}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            الأنشطة الأخيرة
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 14, textAlign: "center" }}>
              لا توجد أنشطة حديثة
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
