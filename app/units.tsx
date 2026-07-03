import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function UnitsScreen() {
  const colors = useColors();
  const [searchText, setSearchText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    unitNumber: "",
    location: "",
    tenantName: "",
    tenantPhone: "",
  });

  const { data: units, isLoading, refetch } = trpc.units.list.useQuery();
  const createUnitMutation = trpc.units.create.useMutation({
    onSuccess: () => {
      refetch();
      setFormData({ unitNumber: "", location: "", tenantName: "", tenantPhone: "" });
      setShowAddForm(false);
    },
  });

  const filteredUnits = units?.filter((unit: any) =>
    unit.unitNumber.includes(searchText) ||
    unit.tenantName?.toLowerCase().includes(searchText.toLowerCase())
  ) || [];

  const handleAddUnit = () => {
    if (!formData.unitNumber.trim()) {
      alert("يرجى إدخال رقم الوحدة");
      return;
    }
    createUnitMutation.mutate({
      unitNumber: formData.unitNumber,
      location: formData.location,
      tenantName: formData.tenantName,
      tenantPhone: formData.tenantPhone,
    });
  };

  const UnitCard = ({ unit }: { unit: any }) => (
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
            الوحدة {unit.unitNumber}
          </Text>
          {unit.location && (
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
              📍 {unit.location}
            </Text>
          )}
          {unit.tenantName && (
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 2 }}>
              👤 {unit.tenantName}
            </Text>
          )}
          {unit.tenantPhone && (
            <Text style={{ fontSize: 12, color: colors.muted }}>
              📞 {unit.tenantPhone}
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

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>
            الوحدات السكنية
          </Text>
        </View>

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
            placeholder="ابحث عن وحدة..."
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

        {/* Add Unit Button */}
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
            إضافة وحدة جديدة
          </Text>
        </TouchableOpacity>

        {/* Add Unit Form */}
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
              بيانات الوحدة الجديدة
            </Text>

            <TextInput
              placeholder="رقم الوحدة"
              placeholderTextColor={colors.muted}
              value={formData.unitNumber}
              onChangeText={(text) => setFormData({ ...formData, unitNumber: text })}
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
              placeholder="الموقع"
              placeholderTextColor={colors.muted}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
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
              placeholder="اسم المستأجر"
              placeholderTextColor={colors.muted}
              value={formData.tenantName}
              onChangeText={(text) => setFormData({ ...formData, tenantName: text })}
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
              placeholder="رقم الهاتف"
              placeholderTextColor={colors.muted}
              value={formData.tenantPhone}
              onChangeText={(text) => setFormData({ ...formData, tenantPhone: text })}
              keyboardType="phone-pad"
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
                onPress={handleAddUnit}
                disabled={createUnitMutation.isPending}
                style={{
                  flex: 1,
                  backgroundColor: colors.success,
                  borderRadius: 8,
                  padding: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {createUnitMutation.isPending ? "جاري الحفظ..." : "حفظ"}
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

        {/* Units List */}
        {filteredUnits.length > 0 ? (
          <FlatList
            data={filteredUnits}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }) => <UnitCard unit={item} />}
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
              {searchText ? "لم يتم العثور على وحدات مطابقة" : "لا توجد وحدات سكنية حتى الآن"}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
