import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ReadingsScreen() {
  const colors = useColors();
  const [selectedMeter, setSelectedMeter] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    reading: "",
    notes: "",
  });

  // Get all units
  const { data: units } = trpc.units.list.useQuery();

  // Get meters for selected unit
  const { data: meters } = trpc.meters.listByUnit.useQuery(
    { unitId: parseInt(selectedUnit) || 0 },
    { enabled: !!selectedUnit }
  );

  // Get readings for selected meter
  const { data: readings, isLoading, refetch } = trpc.readings.listByMeter.useQuery(
    { meterId: selectedMeter ? parseInt(selectedMeter) : 0, limit: 12 },
    { enabled: !!selectedMeter }
  );

  // Get latest reading for selected meter
  const { data: latestReading } = trpc.readings.getLatest.useQuery(
    { meterId: selectedMeter ? parseInt(selectedMeter) : 0 },
    { enabled: !!selectedMeter }
  );

  const createReadingMutation = trpc.readings.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ reading: "", notes: "" });
      setShowAddForm(false);
      Alert.alert("نجاح", "تم إضافة القراءة بنجاح");
    },
    onError: (error) => {
      Alert.alert("خطأ", "فشل إضافة القراءة: " + (error.message || "حاول مرة أخرى"));
    },
  });

  const handleAddReading = () => {
    if (!formData.reading.trim() || !selectedMeter) {
      Alert.alert("تنبيه", "يرجى إدخال القراءة واختيار العداد");
      return;
    }

    const readingValue = parseFloat(formData.reading);
    if (isNaN(readingValue) || readingValue < 0) {
      Alert.alert("خطأ", "يرجى إدخال قيمة رقمية صحيحة وموجبة");
      return;
    }

    // Check if new reading is greater than or equal to last reading
    if (latestReading && readingValue < latestReading.reading) {
      Alert.alert(
        "تحذير",
        `القراءة الجديدة (${readingValue}) أقل من آخر قراءة (${latestReading.reading}). هل تريد المتابعة؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "متابعة",
            onPress: () => submitReading(readingValue),
          },
        ]
      );
    } else {
      submitReading(readingValue);
    }
  };

  const submitReading = (readingValue: number) => {
    createReadingMutation.mutate({
      meterId: parseInt(selectedMeter),
      reading: readingValue,
      notes: formData.notes,
    });
  };

  const selectedMeterData = meters?.find((m: any) => m.id === parseInt(selectedMeter));
  const expectedConsumption = latestReading
    ? Math.max(0, parseFloat(formData.reading || "0") - latestReading.reading)
    : parseFloat(formData.reading || "0");

  const ReadingCard = ({ reading }: { reading: any }) => (
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            القراءة: {reading.reading}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
            الاستهلاك: {reading.consumption} وحدة
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            التاريخ: {new Date(reading.readingDate).toLocaleDateString("ar-SA")}
          </Text>
          {reading.notes && (
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
              ملاحظات: {reading.notes}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            قراءات العدادات
          </Text>
        </View>

        {/* Unit Selector */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            اختر الوحدة:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
            {units?.map((unit: any) => (
              <TouchableOpacity
                key={unit.id}
                onPress={() => {
                  setSelectedUnit(unit.id.toString());
                  setSelectedMeter(""); // Reset meter selection
                }}
                style={{
                  backgroundColor: selectedUnit === unit.id.toString() ? colors.primary : colors.surface,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: selectedUnit === unit.id.toString() ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: selectedUnit === unit.id.toString() ? "white" : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  الوحدة {unit.unitNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meter Selector */}
        {selectedUnit && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              اختر العداد:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
              {meters && meters.length > 0 ? (
                meters.map((meter: any) => (
                  <TouchableOpacity
                    key={meter.id}
                    onPress={() => setSelectedMeter(meter.id.toString())}
                    style={{
                      backgroundColor: selectedMeter === meter.id.toString() ? colors.primary : colors.surface,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: selectedMeter === meter.id.toString() ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedMeter === meter.id.toString() ? "white" : colors.foreground,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {meter.meterNumber}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: colors.muted, fontSize: 12 }}>لا توجد عدادات لهذه الوحدة</Text>
              )}
            </ScrollView>
          </View>
        )}

        {/* Add Reading Button */}
        {selectedMeter && (
          <TouchableOpacity
            onPress={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={{ color: "white", fontWeight: "600", marginLeft: 8 }}>
              إضافة قراءة جديدة
            </Text>
          </TouchableOpacity>
        )}

        {/* Current Meter Info */}
        {selectedMeterData && (
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
              معلومات العداد
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>رقم العداد:</Text>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>
                {selectedMeterData.meterNumber}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>الحالة:</Text>
              <Text
                style={{
                  fontSize: 12,
                  color:
                    selectedMeterData.status === "active"
                      ? colors.success
                      : colors.error,
                  fontWeight: "600",
                }}
              >
                {selectedMeterData.status === "active" ? "نشط" : "معطل"}
              </Text>
            </View>
            {latestReading && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>آخر قراءة:</Text>
                  <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>
                    {latestReading.reading}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>تاريخ آخر قراءة:</Text>
                  <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600" }}>
                    {new Date(latestReading.readingDate).toLocaleDateString("ar-SA")}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Add Reading Form */}
        {showAddForm && selectedMeter && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              إضافة قراءة جديدة
            </Text>

            <TextInput
              placeholder="أدخل القراءة"
              placeholderTextColor={colors.muted}
              value={formData.reading}
              onChangeText={(text) => setFormData({ ...formData, reading: text })}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />

            {/* Expected Consumption Preview */}
            {formData.reading && (
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                  الاستهلاك المتوقع:
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
                  {expectedConsumption.toFixed(2)} وحدة
                </Text>
              </View>
            )}

            <TextInput
              placeholder="ملاحظات (اختياري)"
              placeholderTextColor={colors.muted}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              style={{
                backgroundColor: colors.background,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />

            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={handleAddReading}
                disabled={createReadingMutation.isPending}
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {createReadingMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowAddForm(false);
                  setFormData({ reading: "", notes: "" });
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.foreground, fontWeight: "600" }}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Readings List */}
        {selectedMeter ? (
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : readings && readings.length > 0 ? (
            <>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
                سجل القراءات
              </Text>
              <FlatList
                data={readings}
                keyExtractor={(item: any) => item?.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => <ReadingCard reading={item} />}
                scrollEnabled={false}
              />
            </>
          ) : (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: colors.muted }}>لا توجد قراءات لهذا العداد</Text>
            </View>
          )
        ) : (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ color: colors.muted }}>يرجى اختيار وحدة وعداد</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
