import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function MetersScreen() {
  const colors = useColors();
  const [searchText, setSearchText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [formData, setFormData] = useState({
    meterNumber: "",
  });

  const { data: units } = trpc.units.list.useQuery();
  const { data: meters, isLoading, refetch } = trpc.meters.listByUnit.useQuery(
    { unitId: parseInt(selectedUnit) || 0 },
    { enabled: !!selectedUnit }
  );

  const createMeterMutation = trpc.meters.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ meterNumber: "" });
      setShowAddForm(false);
    },
  });

  const handleAddMeter = () => {
    if (!formData.meterNumber.trim() || !selectedUnit) {
      alert("يرجى إدخال رقم العداد واختيار الوحدة");
      return;
    }
    createMeterMutation.mutate({
      unitId: parseInt(selectedUnit),
      meterNumber: formData.meterNumber,
      meterType: "water",
    });
  };

  const filteredMeters = meters?.filter((meter: any) =>
    meter.meterNumber.includes(searchText)
  ) || [];

  const MeterCard = ({ meter }: { meter: any }) => (
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
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
            العداد {meter.meterNumber}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
            النوع: مياه
          </Text>
          {meter.lastReading && (
            <Text style={{ fontSize: 12, color: colors.muted }}>
              آخر قراءة: {meter.lastReading}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: colors.error,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="trash" size={16} color="white" />
          </TouchableOpacity>
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
            عدادات المياه
          </Text>
        </View>

        {/* Unit Selector */}
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
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>اختر وحدة:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {units?.map((unit: any) => (
              <TouchableOpacity
                key={unit.id}
                onPress={() => setSelectedUnit(unit.id.toString())}
                style={{
                  backgroundColor: selectedUnit === unit.id.toString() ? colors.primary : colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: selectedUnit === unit.id.toString() ? "white" : colors.foreground,
                    fontSize: 12,
                  }}
                >
                  الوحدة {unit.unitNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedUnit && (
          <>
            {/* Search Bar */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 20,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name="search" size={20} color={colors.muted} />
              <TextInput
                placeholder="ابحث عن عداد..."
                placeholderTextColor={colors.muted}
                value={searchText}
                onChangeText={setSearchText}
                style={{
                  flex: 1,
                  marginLeft: 8,
                  color: colors.foreground,
                  fontSize: 14,
                  paddingVertical: 8,
                }}
              />
            </View>

            {/* Add Meter Button */}
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
                إضافة عداد جديد
              </Text>
            </TouchableOpacity>

            {/* Add Meter Form */}
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
                  بيانات العداد الجديد
                </Text>

                <TextInput
                  placeholder="رقم العداد"
                  placeholderTextColor={colors.muted}
                  value={formData.meterNumber}
                  onChangeText={(text) => setFormData({ ...formData, meterNumber: text })}
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

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={handleAddMeter}
                    disabled={createMeterMutation.isPending}
                    style={{
                      flex: 1,
                      backgroundColor: colors.success,
                      borderRadius: 8,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      {createMeterMutation.isPending ? "جاري الحفظ..." : "حفظ"}
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

            {/* Meters List */}
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : filteredMeters.length > 0 ? (
              <FlatList
                data={filteredMeters}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => <MeterCard meter={item} />}
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
                  {searchText ? "لم يتم العثور على عدادات مطابقة" : "لا توجد عدادات لهذه الوحدة"}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
