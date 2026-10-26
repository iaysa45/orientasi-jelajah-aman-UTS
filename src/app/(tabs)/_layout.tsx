import { View, Text } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTema } from "../../../context/temaContext";

export default function TabLayout() {
  const { warna } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: warna.aksen, height: 80 },
        headerTintColor: "#FFFFFF",
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTitle: ({ children }) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#FFFFFF" }}>
              {children}
            </Text>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: warna.latar,
          borderTopColor: warna.garis,
        },
        tabBarActiveTintColor: warna.aksen,
        tabBarInactiveTintColor: warna.teksSekunder,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        sceneStyle: { backgroundColor: warna.latar },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Beranda",
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={focused ? "#2563EB" : "#64748B"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: "Riwayat & Favorit",
          tabBarLabel: "Riwayat",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="time-outline"
              size={size}
              color={focused ? "#2563EB" : "#64748B"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarLabel: "Pengaturan",
          tabBarIcon: ({ color, size, focused }) => (
             <Ionicons
              name="settings-outline"
              size={size}
              color={focused ? "#2563EB" : "#64748B"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tentang"
        options={{
          title: "Tentang",
          tabBarLabel: "Tentang",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={focused ? "#2563EB" : "#64748B"}
            />
          ),
        }}
      />
    </Tabs>
  );
}