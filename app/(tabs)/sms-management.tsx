import { ScrollView, Text, View, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function SMSManagementScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("phones");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("invoice");

  const { data: units } = trpc.units.list.useQuery();
  // Note: SMS endpoints will be added to the backend
  // For now, we'll use placeholder functions
  const phones: any[] = [];
  const isAddingPhone = false;
  const isDeletingPhone = false;
  const isSendingSMS = false;

  const addPhone = () => {
    Alert.alert("معلومة", "سيتم تفعيل هذه الميزة قريباً");
  };

  const deletePhone = () => {
    Alert.alert("معلومة", "سيتم تفعيل هذه الميزة قريباً");
  };

  const sendSMS = () => {
    Alert.alert("معلومة", "سيتم تفعيل هذه الميزة قريباً");
  };

  const handleAddPhone = () => {
    if (!phoneNumber.trim() || !selectedUnit) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف واختيار الوحدة");
      return;
    }

    if (!/^\d{10,}$/.test(phoneNumber.replace(/\D/g, ""))) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
      return;
    }

    addPhone();
  };

  const handleDeletePhone = (phoneId: number) => {
    Alert.alert("تأكيد", "هل أنت متأكد من حذف هذا الرقم؟", [
      { text: "إلغاء", onPress: () => {} },
      {
        text: "حذف",
        onPress: () => {
          deletePhone();
        },
      },
    ]);
  };

  const handleSendSMS = (phoneId: number, unitId: number) => {
    sendSMS();
  };

  const messageTemplates = [
    { label: "فاتورة", value: "invoice" },
    { label: "تذكير متأخر", value: "overdue" },
    { label: "تأكيد دفع", value: "payment_confirmation" },
  ];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            إدارة الرسائل النصية
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {[
            { label: "أرقام الهواتف", value: "phones" },
            { label: "إرسال رسالة", value: "send" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={{
                flex: 1,
                backgroundColor: activeTab === tab.value ? colors.primary : colors.surface,
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  color: activeTab === tab.value ? "white" : colors.foreground,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phones Management Tab */}
        {activeTab === "phones" && (
          <View>
            {/* Add Phone Form */}
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
                إضافة رقم هاتف جديد
              </Text>

              {/* Unit Selection */}
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                اختر الوحدة
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {units?.map((unit: any) => (
                  <TouchableOpacity
                    key={unit.id}
                    onPress={() => setSelectedUnit(unit.id.toString())}
                    style={{
                      backgroundColor: selectedUnit === unit.id.toString() ? colors.primary : colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 8,
                      minWidth: 100,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: selectedUnit === unit.id.toString() ? "white" : colors.foreground,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      الوحدة {(unit as any).unitNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Phone Input */}
              <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                رقم الهاتف
              </Text>
              <TextInput
                placeholder="أدخل رقم الهاتف"
                placeholderTextColor={colors.muted}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                }}
              />

              {/* Add Button */}
              <TouchableOpacity
                onPress={handleAddPhone}
                disabled={isAddingPhone}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                  opacity: isAddingPhone ? 0.5 : 1,
                }}
              >
                {isAddingPhone ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                    إضافة الرقم
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Phones List */}
            <View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
                قائمة الهواتف المسجلة
              </Text>

              {(phones as any[]).length > 0 ? (
                <FlatList
                  data={phones as any[]}
                  keyExtractor={(item: any) => item.id.toString()}
                  renderItem={({ item }: { item: any }) => (
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.primary,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
                            الوحدة {(item as any).unitNumber}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.muted }}>
                            {(item as any).phoneNumber}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleDeletePhone(item.id)}
                          disabled={isDeletingPhone}
                        >
                          <Ionicons name="trash" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => handleSendSMS(item.id, item.unitId)}
                          disabled={isSendingSMS}
                          style={{
                            flex: 1,
                            backgroundColor: colors.success,
                            borderRadius: 8,
                            paddingVertical: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                            إرسال فاتورة
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleSendSMS(item.id, item.unitId)}
                          disabled={isSendingSMS}
                          style={{
                            flex: 1,
                            backgroundColor: colors.warning,
                            borderRadius: 8,
                            paddingVertical: 8,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                            تذكير
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
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
                    لا توجد أرقام هواتف مسجلة
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Send Message Tab */}
        {activeTab === "send" && (
          <View>
            {/* Message Template Selection */}
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
                اختر نوع الرسالة
              </Text>

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {messageTemplates.map((template) => (
                  <TouchableOpacity
                    key={template.value}
                    onPress={() => setMessageTemplate(template.value)}
                    style={{
                      backgroundColor: messageTemplate === template.value ? colors.primary : colors.border,
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
                        color: messageTemplate === template.value ? "white" : colors.foreground,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {template.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Message Preview */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
                معاينة الرسالة
              </Text>

              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 100,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.foreground, lineHeight: 18 }}>
                  {messageTemplate === "invoice"
                    ? "السلام عليكم، فاتورتك الشهرية جاهزة. المبلغ المستحق: [المبلغ] د.إ. يرجى السداد قبل [التاريخ]."
                    : messageTemplate === "overdue"
                      ? "تنبيه: فاتورتك متأخرة عن السداد. المبلغ المستحق: [المبلغ] د.إ. يرجى السداد فوراً."
                      : "شكراً لك! تم استلام دفعتك بنجاح. المبلغ: [المبلغ] د.إ. رقم الإيصال: [الرقم]"}
                </Text>
              </View>

              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 12 }}>
                ملاحظة: سيتم استبدال الحقول بين الأقواس بالبيانات الفعلية
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
