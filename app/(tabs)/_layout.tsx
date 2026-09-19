import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import NotificationBell from "../../src/components/NotificationBell";
import { useLanguage } from "../../src/context/LanguageContext";

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        headerRight: () => (
          <View style={{ marginRight: 12, marginTop: 8 }}>
            <NotificationBell />
          </View>
        ),

        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#8e9eaf",

        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e8edf3",
          height: 60,
          paddingBottom: 4,
          paddingTop: 4,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },

        // ✅ RAPATKAN JARAK ANTAR ICON
        tabBarItemStyle: {
          paddingHorizontal: 0,
          marginHorizontal: -13,
        },

        tabBarLabelStyle: {
          fontSize: 6,
          fontWeight: "600",
          letterSpacing: 0,
        },
        headerStyle: {
          backgroundColor: "transparent",
          elevation: 0,
          shadowOpacity: 0,
          height: 150,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          letterSpacing: 0.5,
        },
        headerShadowVisible: false,
        headerBackground: () => (
          <ImageBackground
            source={require("../../assets/images/headerpdam6.png")}
            style={styles.headerBackgroundImage}
            resizeMode="cover"
          />
        ),
      }}
    >
      {/* TAB DASHBOARD */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("menu.dashboard"),
          tabBarLabel: t("menu.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer-outline" size={size} color={color} />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB MASTER BARANG */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("menu.barang"),
          tabBarLabel: t("menu.barang"),
          tabBarIcon: ({ color, size }) => (
            <Entypo name="box" size={size} color={color} />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB BARANG MASUK */}
      <Tabs.Screen
        name="masuk"
        options={{
          title: t("menu.masuk"),
          tabBarLabel: t("menu.masuk"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="inbox-arrow-down"
              size={size}
              color={color}
            />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB BARANG KELUAR */}
      <Tabs.Screen
        name="keluar"
        options={{
          title: t("menu.keluar"),
          tabBarLabel: t("menu.keluar"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="arrow-up-circle-outline"
              size={size}
              color={color}
            />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB AI ASSISTANT */}
      <Tabs.Screen
        name="ai-chat"
        options={{
          title: "AI Assistant",
          tabBarLabel: "AI",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB LAPORAN */}
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarLabel: "Laporan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: t("menu.profile"),
          tabBarLabel: t("menu.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerTitle: () => null,
        }}
      />

      {/* TAB PENGATURAN (Tersembunyi) */}
      <Tabs.Screen
        name="pengaturan"
        options={{
          href: null,
          title: "",
        }}
      />

      {/* TAB NOTIFIKASI (Tersembunyi dari tab bar) */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: t("menu.notifikasi"),
          headerTitle: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBackgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
