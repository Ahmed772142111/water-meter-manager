import { ScrollView, Text, View, TouchableOpacity, Switch, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function SettingsScreen() {
  const colors = useColors();
  const [currency, setCurrency] = useState("AED");
  const [waterRate, setWaterRate] = useState("2.50");
  const [adminFee, setAdminFee] = useState("10.00");
  const [lateFee, setLateFee] = useState("5.00");
  const [companyName, setCompanyName] = useState("شركة إدارة العقارات");
  const [companyPhone, setCompanyPhone] = useState("+971501234567");
  const [companyEmail, setCompanyEmail] = useState("info@company.ae");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [editingMode, setEditingMode] = useState(false);

  const handleSaveSettings = () => {
    Alert.alert("نجح", "تم حفظ الإعدادات بنجاح");
    setEditingMode(false);
  };

  const SettingItem = ({ icon, title, value, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 10,
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
            {value}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  const SwitchItem = ({ icon, title, value, onToggle }: any) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 8,
            padding: 10,
            marginRight: 12,
          }}
        >
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.success }}
        thumbColor={value ? colors.success : colors.muted}
      />
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            الإعدادات
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
            إدارة إعدادات التطبيق والحساب
          </Text>
        </View>

        {/* Company Information Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
            بيانات الشركة
          </Text>

          {editingMode ? (
            <>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                اسم الشركة
              </Text>
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                رقم الهاتف
              </Text>
              <TextInput
                value={companyPhone}
                onChangeText={setCompanyPhone}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                البريد الإلكتروني
              </Text>
              <TextInput
                value={companyEmail}
                onChangeText={setCompanyEmail}
                keyboardType="email-address"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />
            </>
          ) : (
            <>
              <SettingItem
                icon="business"
                title="اسم الشركة"
                value={companyName}
              />
              <SettingItem
                icon="call"
                title="رقم الهاتف"
                value={companyPhone}
              />
              <SettingItem
                icon="mail"
                title="البريد الإلكتروني"
                value={companyEmail}
              />
            </>
          )}
        </View>

        {/* Billing Settings Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
            إعدادات الفواتير
          </Text>

          {editingMode ? (
            <>
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                العملة
              </Text>
              <TextInput
                value={currency}
                onChangeText={setCurrency}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                سعر المياه (لكل وحدة)
              </Text>
              <TextInput
                value={waterRate}
                onChangeText={setWaterRate}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                رسم إداري
              </Text>
              <TextInput
                value={adminFee}
                onChangeText={setAdminFee}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />

              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>
                رسم التأخير
              </Text>
              <TextInput
                value={lateFee}
                onChangeText={setLateFee}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  fontSize: 14,
                }}
              />
            </>
          ) : (
            <>
              <SettingItem
                icon="cash"
                title="العملة"
                value={currency}
              />
              <SettingItem
                icon="water"
                title="سعر المياه"
                value={`${waterRate} ${currency}`}
              />
              <SettingItem
                icon="document"
                title="الرسم الإداري"
                value={`${adminFee} ${currency}`}
              />
              <SettingItem
                icon="alert"
                title="رسم التأخير"
                value={`${lateFee} ${currency}`}
              />
            </>
          )}
        </View>

        {/* Notification Settings Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
            الإشعارات
          </Text>

          <SwitchItem
            icon="notifications"
            title="تفعيل الإشعارات"
            value={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />

          {notificationsEnabled && (
            <>
              <SwitchItem
                icon="alert-circle"
                title="تنبيهات الفواتير المتأخرة"
                value={true}
                onToggle={() => {}}
              />
              <SwitchItem
                icon="checkmark-circle"
                title="تنبيهات المدفوعات"
                value={true}
                onToggle={() => {}}
              />
              <SwitchItem
                icon="calendar"
                title="تنبيهات قراءات العدادات"
                value={true}
                onToggle={() => {}}
              />
            </>
          )}
        </View>

        {/* Display Settings Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
            العرض
          </Text>

          <SwitchItem
            icon="moon"
            title="الوضع الليلي"
            value={darkMode}
            onToggle={setDarkMode}
          />
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          {editingMode ? (
            <>
              <TouchableOpacity
                onPress={() => setEditingMode(false)}
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
                onPress={handleSaveSettings}
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                  حفظ التغييرات
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={() => setEditingMode(true)}
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
              <Ionicons name="pencil" size={18} color="white" />
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14, marginLeft: 8 }}>
                تعديل الإعدادات
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground, marginBottom: 12 }}>
            الحساب
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 10,
                  marginRight: 12,
                }}
              >
                <Ionicons name="information-circle" size={20} color="white" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                عن التطبيق
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors.error,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>
              تسجيل الخروج
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
            إصدار التطبيق
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>
            1.0.0
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
