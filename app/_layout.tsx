import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";

function RootLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f4f8",
        }}
      >
        <ActivityIndicator size="large" color="#0d47a1" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
