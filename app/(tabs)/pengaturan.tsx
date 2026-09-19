import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import {
  backupData,
  restoreData,
  hapusCache,
  getBackupInfo,
} from "../../src/utils/backupHelper";
import { useLanguage } from "../../src/context/LanguageContext";

export default function PengaturanScreen() {
  const [loading, setLoading] = useState(false);
  const [backupInfo, setBackupInfo] = useState({ exists: false });
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    cekInfoBackup();
  }, []);

  const cekInfoBackup = async () => {
    const info = await getBackupInfo();
    setBackupInfo(info);
  };

  // ===== HANDLE BACKUP =====
  const handleBackup = () => {
    Alert.alert(t("pengaturan.backup_title"), t("pengaturan.backup_desc"), [
      { text: t("common.batal"), style: "cancel" },
      {
        text: t("pengaturan.backup_now"),
        onPress: async () => {
          setLoading(true);
          const result = await backupData();
          setLoading(false);

          if (result.success) {
            await cekInfoBackup();
            Alert.alert(
              t("pengaturan.backup_success"),
              `${t("pengaturan.file")}: ${result.filename}\n\n📊 Size: ${(result.size / 1024).toFixed(2)} KB\n\n📦 Data:\n• Barang: ${result.counts.barang}\n• Barang Masuk: ${result.counts.barang_masuk}\n• Barang Keluar: ${result.counts.barang_keluar}`,
            );
          } else {
            Alert.alert(t("common.gagal"), result.error || t("common.gagal"));
          }
        },
      },
    ]);
  };

  // ===== HANDLE RESTORE =====
  const handleRestore = () => {
    if (!backupInfo.exists) {
      Alert.alert(t("pengaturan.no_backup"), t("pengaturan.no_backup_desc"));
      return;
    }

    Alert.alert(
      t("pengaturan.restore_title"),
      `${t("pengaturan.file")}: ${backupInfo.filename}\n${t("pengaturan.created")}: ${new Date(backupInfo.created_at).toLocaleString(locale === "id" ? "id-ID" : "en-US")}\n\n${t("pengaturan.restore_desc")}`,
      [
        { text: t("common.batal"), style: "cancel" },
        {
          text: t("pengaturan.restore_button"),
          onPress: async () => {
            setLoading(true);
            const result = await restoreData();
            setLoading(false);

            if (result.success) {
              Alert.alert(
                t("pengaturan.restore_success"),
                `📦 Data:\n• Barang: ${result.counts.barang}\n• Barang Masuk: ${result.counts.barang_masuk}\n• Barang Keluar: ${result.counts.barang_keluar}`,
              );
            } else {
              Alert.alert(t("common.gagal"), result.error || t("common.gagal"));
            }
          },
        },
      ],
    );
  };

  // ===== HANDLE HAPUS CACHE =====
  const handleHapusCache = () => {
    Alert.alert(t("pengaturan.cache_title"), t("pengaturan.cache_desc"), [
      { text: t("common.batal"), style: "cancel" },
      {
        text: t("common.hapus"),
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          const result = await hapusCache();
          setLoading(false);

          if (result.success) {
            setBackupInfo({ exists: false });
            Alert.alert(t("common.sukses"), t("pengaturan.cache_success"));
          } else {
            Alert.alert(t("common.gagal"), result.error || t("common.gagal"));
          }
        },
      },
    ]);
  };

  const handleSimpan = () => {
    Alert.alert(t("common.sukses"), t("pengaturan.saved"));
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>{t("pengaturan.processing")}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== BAHASA ===== */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="language" size={20} color="#0288d1" />
            </View>
            <View style={styles.sectionTextWrapper}>
              <Text style={styles.sectionTitle}>{t("pengaturan.bahasa")}</Text>
              <Text style={styles.sectionDesc}>
                {t("pengaturan.pilih_bahasa")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.langItem, locale === "id" && styles.langItemActive]}
            onPress={() => setLocale("id")}
          >
            <Text style={styles.langFlag}>🇮🇩</Text>
            <Text style={styles.langText}>{t("pengaturan.indonesia")}</Text>
            {locale === "id" && (
              <Ionicons name="checkmark-circle" size={22} color="#0288d1" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langItem, locale === "en" && styles.langItemActive]}
            onPress={() => setLocale("en")}
          >
            <Text style={styles.langFlag}>🇬🇧</Text>
            <Text style={styles.langText}>{t("pengaturan.inggris")}</Text>
            {locale === "en" && (
              <Ionicons name="checkmark-circle" size={22} color="#0288d1" />
            )}
          </TouchableOpacity>
        </View>

        {/* ===== INFO BACKUP ===== */}
        {backupInfo.exists && (
          <View style={styles.infoCard}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>
                {t("pengaturan.backup_available")}
              </Text>
              <Text style={styles.infoDesc}>📁 {backupInfo.filename}</Text>
              <Text style={styles.infoDesc}>
                📅{" "}
                {new Date(backupInfo.created_at).toLocaleString(
                  locale === "id" ? "id-ID" : "en-US",
                )}
              </Text>
              <Text style={styles.infoDesc}>📊 Size: {backupInfo.size} KB</Text>
            </View>
          </View>
        )}

        {/* ===== CARD DATA ===== */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="cloud-outline" size={20} color="#2563eb" />
            </View>
            <View style={styles.sectionTextWrapper}>
              <Text style={styles.sectionTitle}>
                {t("pengaturan.data_storage")}
              </Text>
              <Text style={styles.sectionDesc}>
                {t("pengaturan.data_storage_desc")}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleBackup}
            disabled={loading}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#dbeafe" }]}>
              <Ionicons name="cloud-upload-outline" size={18} color="#2563eb" />
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuLabel}>{t("pengaturan.backup")}</Text>
              <Text style={styles.menuDesc}>
                {t("pengaturan.backup_desc_short")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRestore}
            disabled={loading}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#dcfce7" }]}>
              <Ionicons
                name="cloud-download-outline"
                size={18}
                color="#16a34a"
              />
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuLabel}>{t("pengaturan.restore")}</Text>
              <Text style={styles.menuDesc}>
                {t("pengaturan.restore_desc_short")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemLast]}
            onPress={handleHapusCache}
            disabled={loading}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </View>
            <View style={styles.menuTextWrapper}>
              <Text style={styles.menuLabel}>{t("pengaturan.cache")}</Text>
              <Text style={styles.menuDesc}>
                {t("pengaturan.cache_desc_short")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* ===== TOMBOL SIMPAN ===== */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSimpan}>
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnGradient}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>
              {t("pengaturan.simpan_pengaturan")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("auth.footer")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  infoIconWrapper: { padding: 4 },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#166534" },
  infoDesc: { fontSize: 11, color: "#166534", marginTop: 1 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTextWrapper: { flex: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  sectionDesc: { fontSize: 12, color: "#94a3b8", marginTop: 1 },

  // ===== LANGUAGE ITEM =====
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    marginTop: 8,
  },
  langItemActive: {
    backgroundColor: "#e0f2fe",
    borderWidth: 1,
    borderColor: "#0288d1",
  },
  langFlag: { fontSize: 22 },
  langText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0f172a" },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrapper: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  menuDesc: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  saveBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: { alignItems: "center", paddingVertical: 20 },
  footerText: { fontSize: 12, color: "#94a3b8" },
});
