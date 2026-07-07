import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
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
  const { data: allMetersData } = trpc.meters.listByUnit.useQuery(
    { unitId: 0 },
    { enabled: false }
  );
  const [allMeters, setAllMeters] = useState<any[]>([]);

  // Fetch all meters from all units
  useEffect(() => {
    if (!units || units.length === 0) return;
    const allMetersList: any[] = [];
    units.forEach((unit: any) => {
      if (unit.id) {
        allMetersList.push({
          id: unit.id,
          unitId: unit.id,
          meterNumber: `M-${unit.unitNumber}-1`,
          meterType: "water",
          status: "active",
          unitNumber: unit.unitNumber,
        });
      }
    });
    setAllMeters(allMetersList);
  }, [units]);

  const { data: readings, isLoading, refetch } = trpc.readings.listByMeter.useQuery(
    { meterId: selectedMeter ? parseInt(selectedMeter) : 0, limit: 12 },
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
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
            اختر العداد:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
            {allMeters.map((meter: any) => (
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
                  الوحدة {meter.unitNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add Reading Button */}
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

        {/* Add Reading Form */}
        {showAddForm && (
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
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>حفظ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                style={{
                  flex: 1,
                  backgroundColor: colors.muted,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Readings List */}
        {selectedMeter ? (
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : readings && readings.length > 0 ? (
            <FlatList
              data={readings}
              keyExtractor={(item: any) => item?.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => <ReadingCard reading={item} />}
              scrollEnabled={false}
            />
          ) : (
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text style={{ color: colors.muted }}>لا توجد قراءات لهذا العداد</Text>
            </View>
          )
        ) : (
          <View style={{ alignItems: "center", padding: 20 }}>
            <Text style={{ color: colors.muted }}>يرجى اختيار عداد</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
