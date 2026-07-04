import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function ReadingsScreen() {
  const colors = useColors();
  const [selectedMeter, setSelectedMeter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    reading: "",
    notes: "",
  });

  const { data: units } = trpc.units.list.useQuery();
  const { data: meters } = trpc.meters.listByUnit.useQuery(
    { unitId: units?.[0]?.id || 0 },
    { enabled: !!units?.[0]?.id }
  );

  const { data: readings, isLoading, refetch } = trpc.readings.listByMeter.useQuery(
    { meterId: parseInt(selectedMeter) || 0, limit: 12 },
    { enabled: !!selectedMeter }
  );

  const createReadingMutation = trpc.readings.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ reading: "", notes: "" });
      setShowAddForm(false);
    },
  });

  const handleAddReading = () => {
    if (!formData.reading.trim() || !selectedMeter) {
      alert("يرجى إدخال القراءة واختيار العداد");
      return;
    }

    const readingValue = parseFloat(formData.reading);
    if (isNaN(readingValue)) {
      alert("يرجى إدخال قيمة رقمية صحيحة");
      return;
    }

    createReadingMutation.mutate({
      meterId: parseInt(selectedMeter),
      reading: readingValue,
      notes: formData.notes,
    });
  };

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

  const allMeters = units?.flatMap((unit: any) => 
    meters?.filter((m: any) => m.unitId === unit.id) || []
  ) || [];

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            قراءات العدادات
          </Text>
        </View>

        {/* Meter Selector */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>اختر عداد:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allMeters.map((meter: any) => (
              <TouchableOpacity
                key={meter.id}
                onPress={() => setSelectedMeter(meter.id.toString())}
                style={{
                  backgroundColor: selectedMeter === meter.id.toString() ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: selectedMeter === meter.id.toString() ? "white" : colors.foreground,
                    fontSize: 12,
                  }}
                >
                  {meter.meterNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedMeter && (
          <>
            {/* Add Reading Button */}
            <TouchableOpacity
              onPress={() => setShowAddForm(!showAddForm)}
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
                إضافة قراءة جديدة
              </Text>
            </TouchableOpacity>

            {/* Add Reading Form */}
            {showAddForm && (
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
                  قراءة عداد جديدة
                </Text>

                <TextInput
                  placeholder="القراءة (رقم)"
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

                <TextInput
                  placeholder="ملاحظات (اختياري)"
                  placeholderTextColor={colors.muted}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    color: colors.foreground,
                    borderWidth: 1,
                    borderColor: colors.border,
                    textAlignVertical: "top",
                  }}
                />

                <View style={{ flexDirection: "row", gap: 12 }}>
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
                    onPress={() => setShowAddForm(false)}
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
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
              السجل التاريخي
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : readings && readings.length > 0 ? (
              <FlatList
                data={readings}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => <ReadingCard reading={item} />}
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
                  لا توجد قراءات مسجلة لهذا العداد
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
