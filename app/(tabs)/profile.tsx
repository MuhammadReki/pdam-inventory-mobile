import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../../src/api";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../src/context/LanguageContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });

  const menuItems = [
    {
      key: "pengaturan",
      icon: "settings-outline",
      label: t("profile.pengaturan"),
      desc: t("profile.pengaturan_desc"),
      color: "#2563eb",
      bg: "#dbeafe",
      content: {
        title: t("profile.pengaturan"),
        body: t("profile.pengaturan_body"),
      },
    },
    {
      key: "bantuan",
      icon: "help-circle-outline",
      label: t("profile.bantuan"),
      desc: t("profile.bantuan_desc"),
      color: "#9b59b6",
      bg: "#f3e8ff",
      content: {
        title: t("profile.bantuan"),
        body: t("profile.bantuan_body"),
      },
    },
    {
      key: "tentang",
      icon: "information-circle-outline",
      label: t("profile.tentang"),
      desc: t("profile.tentang_desc"),
      color: "#3498db",
      bg: "#dbeafe",
      content: {
        title: t("profile.tentang"),
        body: t("profile.tentang_body"),
      },
    },
  ];

  const handleMenuPress = (item) => {
    if (item.key === "pengaturan") {
      router.push("/(tabs)/pengaturan");
      return;
    }
    setModalContent(item.content);
    setModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    if (!name) {
      Alert.alert(t("common.error"), t("profile.nama_wajib"));
      return;
    }
    setLoading(true);
    try {
      await api.put("/profile", { name, email });
      Alert.alert(t("common.sukses"), t("profile.sukses_update"));
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("common.gagal"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("profile.field_wajib"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("profile.password_tidak_sama"));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t("common.error"), t("profile.password_min"));
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put("/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      Alert.alert(t("common.sukses"), t("profile.sukses_password"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("common.gagal"),
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t("profile.konfirmasi_logout"), t("profile.yakin_logout"), [
      { text: t("common.batal"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* CARD PROFIL */}
        <View style={styles.card}>
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
              <Text style={styles.userName}>{user?.name || "User"}</Text>
              <Text style={styles.userEmail}>
                {user?.email || "email@domain.com"}
              </Text>
              <View style={styles.badge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={12}
                  color="#fff"
                />
                <Text style={styles.badgeText}>
                  {t("profile.administrator")}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
              </View>
              <Text style={styles.infoLabel}>{t("profile.bergabung")}</Text>
              <Text style={styles.infoValue}>
                {formatDate(user?.created_at)}
              </Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoIcon}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
              </View>
              <Text style={styles.infoLabel}>
                {t("profile.update_terakhir")}
              </Text>
              <Text style={styles.infoValue}>
                {formatDate(user?.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* MENU PENGATURAN */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="apps-outline" size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>
                {t("profile.menu_pengaturan")}
              </Text>
            </View>
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.menuTextWrapper}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* EDIT PROFIL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIcon}>
                <Ionicons name="pencil-outline" size={18} color="#2563eb" />
              </View>
              <Text style={styles.cardTitle}>{t("profile.edit")}</Text>
            </View>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editBtnText}>{t("profile.ubah")}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View>
              <Text style={styles.inputLabel}>{t("profile.nama_lengkap")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={t("profile.nama_lengkap")}
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={styles.inputLabel}>{t("profile.email")}</Text>
              <View style={[styles.inputWrapper, styles.inputDisabledWrapper]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={email}
                  editable={false}
                />
              </View>
              <Text style={styles.helperText}>
                {t("profile.email_tidak_diubah")}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                  }}
                >
                  <Text style={styles.btnCancelText}>{t("common.batal")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSave]}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.btnSaveText}>{t("common.simpan")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>
                  {t("profile.nama_lengkap")}
                </Text>
                <Text style={styles.profileValue}>{user?.name || "-"}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>{t("profile.email")}</Text>
                <Text style={styles.profileValue}>{user?.email || "-"}</Text>
              </View>
            </View>
          )}
        </View>

        {/* GANTI PASSWORD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={[styles.cardHeaderIcon, styles.cardHeaderIconDanger]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#dc2626"
                />
              </View>
              <Text style={styles.cardTitle}>
                {t("profile.ganti_password")}
              </Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>{t("profile.password_lama")}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="key-outline"
              size={18}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t("profile.password_lama_placeholder")}
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>

          <Text style={styles.inputLabel}>{t("profile.password_baru")}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t("profile.password_baru_placeholder")}
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>

          <Text style={styles.inputLabel}>{t("profile.konfirmasi")}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#94a3b8"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("profile.konfirmasi_placeholder")}
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.passwordBtn}
            onPress={handleChangePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.passwordBtnText}>
                {t("profile.perbarui_password")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutBtnText}>{t("profile.logout")}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("auth.footer")}</Text>
        </View>
      </ScrollView>

      {/* MODAL INFO */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalBody}>{modalContent.body}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>{t("common.tutup")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: { paddingBottom: 30 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderIconDanger: { backgroundColor: "#fee2e2" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  avatarGradient: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 0,
  },
  avatarContainer: { alignItems: "center" },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
  userName: { fontSize: 18, fontWeight: "700", color: "#fff", marginTop: 10 },
  userEmail: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  infoContainer: { paddingHorizontal: 18, paddingVertical: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoIcon: { width: 28, alignItems: "center" },
  infoLabel: { fontSize: 14, color: "#64748b", marginLeft: 8, flex: 1 },
  infoValue: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrapper: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  menuDesc: { fontSize: 12, color: "#94a3b8", marginTop: 1 },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
  },
  inputDisabledWrapper: { backgroundColor: "#f1f5f9" },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#0f172a" },
  inputDisabled: { color: "#94a3b8" },
  helperText: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
  profileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  profileLabel: { fontSize: 14, color: "#64748b" },
  profileValue: { fontSize: 14, color: "#0f172a", fontWeight: "500" },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 12,
  },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  btnCancel: { backgroundColor: "#f1f5f9" },
  btnCancelText: { color: "#64748b", fontWeight: "600", fontSize: 14 },
  btnSave: { backgroundColor: "#2563eb" },
  btnSaveText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  editBtn: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editBtnText: { color: "#2563eb", fontWeight: "600", fontSize: 13 },
  passwordBtn: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
  },
  passwordBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  logoutBtn: {
    backgroundColor: "#fef2f2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignSelf: "center",
    width: "40%",
  },
  logoutBtnText: { color: "#dc2626", fontWeight: "600", fontSize: 14 },
  footer: { alignItems: "center", paddingVertical: 20 },
  footerText: { fontSize: 12, color: "#94a3b8" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", flex: 1 },
  modalClose: { padding: 4 },
  modalBody: { fontSize: 14, color: "#475569", lineHeight: 22 },
  modalButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
