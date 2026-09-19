import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../../src/api";
import { useLanguage } from "../../src/context/LanguageContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();

  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), t("auth.email_password_wajib"));
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        t("auth.login_gagal"),
        result.error || t("auth.email_password_salah"),
      );
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Alert.alert(t("common.error"), t("auth.email_wajib"));
      return;
    }

    setResetLoading(true);
    try {
      const response = await api.post("/forgot-password", {
        email: resetEmail,
      });
      if (response.data.success) {
        Alert.alert(t("common.sukses"), response.data.message);
        setModalVisible(false);
        setResetEmail("");
      } else {
        Alert.alert(t("common.gagal"), response.data.message);
      }
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("common.gagal"),
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Background Login Mobile PDAM.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* LOGO */}
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/LOGO-PDAM-ASLI-removebg-preview.png")}
                style={styles.logo}
              />
              <Text style={styles.title}>PDAM Inventory</Text>
              <Text style={styles.subtitle}>{t("auth.app_subtitle")}</Text>
            </View>

            {/* SELAMAT DATANG */}
            <Text style={styles.welcomeText}>{t("auth.welcome")}</Text>
            <Text style={styles.welcomeSubtext}>{t("auth.welcome_desc")}</Text>

            {/* FORM */}
            <View style={styles.form}>
              <Text style={styles.label}>{t("auth.email")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#6c7a8a"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("auth.email_placeholder")}
                  placeholderTextColor="#a0aec0"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <Text style={styles.label}>{t("auth.password")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#6c7a8a"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t("auth.password_placeholder")}
                  placeholderTextColor="#a0aec0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.forgotPasswordText}>
                  {t("auth.forgot_password")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {t("auth.login_button")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("auth.footer")}</Text>
              <Text style={styles.footerSubtext}>{t("auth.footer_desc")}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL LUPA PASSWORD */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              🔑 {t("auth.forgot_password")}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t("auth.forgot_password_desc")}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder={t("auth.email_placeholder")}
              placeholderTextColor="#a0aec0"
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setResetEmail("");
                }}
              >
                <Text style={styles.modalBtnCancelText}>
                  {t("common.batal")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSend]}
                onPress={handleForgotPassword}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBtnSendText}>{t("auth.kirim")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { flex: 1, resizeMode: "cover", width: "100%", height: "100%" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    width: "100%",
    maxWidth: 360,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: { alignItems: "center", marginBottom: 12 },
  logo: { width: 80, height: 80, marginBottom: 6, resizeMode: "contain" },
  title: { fontSize: 18, fontWeight: "700", color: "#0d47a1" },
  subtitle: { fontSize: 11, color: "#6c7a8a", marginTop: 2 },
  welcomeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a2332",
    textAlign: "center",
    marginBottom: 2,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: "#6c7a8a",
    textAlign: "center",
    marginBottom: 16,
  },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#1a2332", marginBottom: 2 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#fafbfc",
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1a2332" },
  forgotPassword: { alignSelf: "flex-end", marginTop: 2 },
  forgotPasswordText: { fontSize: 12, color: "#0d47a1", fontWeight: "500" },
  button: {
    backgroundColor: "#0d47a1",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footer: { marginTop: 14, alignItems: "center", gap: 2 },
  footerText: { fontSize: 10, color: "#94a3b8" },
  footerSubtext: { fontSize: 9, color: "#94a3b8" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 380,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a2332",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6c7a8a",
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    backgroundColor: "#fafbfc",
    marginBottom: 16,
    color: "#1a2332",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
  modalBtnCancel: { backgroundColor: "#e8edf3" },
  modalBtnCancelText: { color: "#1a2332", fontWeight: "600" },
  modalBtnSend: { backgroundColor: "#0d47a1" },
  modalBtnSendText: { color: "#fff", fontWeight: "600" },
});
