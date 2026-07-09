import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput, Alert } from "react-native";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
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
      Alert.alert("نجاح", "تم إضافة العداد بنجاح");
    },
    onError: (error) => {
      Alert.alert("خطأ", "فشل إضافة العداد: " + (error.message || "حاول مرة أخرى"));
    },
  });

  const updateMeterMutation = trpc.meters.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingId(null);
      setEditFormData(null);
      Alert.alert("نجاح", "تم تحديث العداد بنجاح");
    },
    onError: (error) => {
      Alert.alert("خطأ", "فشل تحديث العداد: " + (error.message || "حاول مرة أخرى"));
    },
  });

  const deleteMeterMutation = trpc.meters.delete.useMutation({
    onSuccess: () => {
      refetch();
      Alert.alert("نجاح", "تم حذف العداد بنجاح");
    },
    onError: (error) => {
      Alert.alert("خطأ", "فشل حذف العداد: " + (error.message || "حاول مرة أخرى"));
    },
  });

  const handleAddMeter = () => {
    if (!formData.meterNumber.trim() || !selectedUnit) {
      Alert.alert("تنبيه", "يرجى إدخال رقم العداد واختيار الوحدة");
      return;
    }
    createMeterMutation.mutate({
      unitId: parseInt(selectedUnit),
      meterNumber: formData.meterNumber,
      meterType: "water",
    });
  };

  const handleDeleteMeter = (meterId: number) => {
    Alert.alert(
      "تأكيد الحذف",
      "هل تريد حذف هذا العداد؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => deleteMeterMutation.mutate({ id: meterId }),
        },
      ]
    );
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
          <Text
            style={{
              fontSize: 12,
              color: meter.status === "active" ? colors.success : colors.error,
              marginBottom: 4,
            }}
          >
            الحالة: {meter.status === "active" ? "نشط" : meter.status === "inactive" ? "معطل" : "معيب"}
          </Text>
          {meter.lastReading && (
            <Text style={{ fontSize: 12, color: colors.muted }}>
              آخر قراءة: {meter.lastReading}
            </Text>
          )}
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              setEditingId(meter.id);
              setEditFormData({ ...meter });
            }}
            style={{
              backgroundColor: colors.primary,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteMeter(meter.id)}
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
              onPress={() => {
                setShowAddForm(!showAddForm);
                setEditingId(null);
              }}
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

            {/* Edit Meter Form */}
            {editingId && editFormData && (
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
                  تعديل العداد
                </Text>

                <TextInput
                  placeholder="رقم العداد"
                  placeholderTextColor={colors.muted}
                  value={editFormData.meterNumber}
                  onChangeText={(text) => setEditFormData({ ...editFormData, meterNumber: text })}
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
                  <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>الحالة:</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {["active", "inactive", "faulty"].map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setEditFormData({ ...editFormData, status })}
                        style={{
                          flex: 1,
                          backgroundColor:
                            editFormData.status === status ? colors.primary : colors.border,
                          borderRadius: 6,
                          padding: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: editFormData.status === status ? "white" : colors.foreground,
                            fontSize: 11,
                          }}
                        >
                          {status === "active" ? "نشط" : status === "inactive" ? "معطل" : "معيب"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      updateMeterMutation.mutate({
                        id: editingId,
                        meterNumber: editFormData.meterNumber,
                        status: editFormData.status,
                      });
                    }}
                    disabled={updateMeterMutation.isPending}
                    style={{
                      flex: 1,
                      backgroundColor: colors.success,
                      borderRadius: 8,
                      padding: 12,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      {updateMeterMutation.isPending ? "جاري التحديث..." : "تحديث"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setEditingId(null);
                      setEditFormData(null);
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

            {/* Add Meter Form */}
            {showAddForm && !editingId && (
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
                    onPress={() => {
                      setShowAddForm(false);
                      setFormData({ meterNumber: "" });
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
