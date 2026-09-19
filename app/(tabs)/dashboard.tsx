import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import api from "../../src/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLanguage } from "../../src/context/LanguageContext";

export default function DashboardScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    total_barang: 0,
    total_stok: 0,
    stok_menipis: 0,
    stok_kritis: 0,
  });
  const [listBarang, setListBarang] = useState([]);
  const [filteredBarang, setFilteredBarang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = async () => {
    try {
      const response = await api.get("/dashboard-stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error stats:", error);
    }
  };

  const fetchListBarang = async () => {
    try {
      const response = await api.get("/listbarang");
      setListBarang(response.data.data);
      setFilteredBarang(response.data.data);
    } catch (error) {
      console.error("Error listbarang:", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchListBarang()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredBarang(listBarang);
    } else {
      const filtered = listBarang.filter(
        (item) =>
          item.nama_barang.toLowerCase().includes(text.toLowerCase()) ||
          item.kode_barang.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredBarang(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredBarang(listBarang);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d47a1" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0d47a1"]}
            tintColor="#0d47a1"
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* 4 KARTU STATISTIK */}
        <View style={styles.cardGrid}>
          <View style={[styles.cardStat, styles.cardBlue]}>
            <View style={styles.cardStatIcon}>
              <Ionicons name="cube-outline" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardStatLabel}>
                {t("dashboard.total_barang")}
              </Text>
              <Text style={styles.cardStatValue}>{stats.total_barang}</Text>
            </View>
          </View>

          <View style={[styles.cardStat, styles.cardGreen]}>
            <View style={styles.cardStatIcon}>
              <Ionicons name="layers-outline" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardStatLabel}>
                {t("dashboard.total_stok")}
              </Text>
              <Text style={styles.cardStatValue}>{stats.total_stok}</Text>
            </View>
          </View>

          <View style={[styles.cardStat, styles.cardYellow]}>
            <View style={styles.cardStatIcon}>
              <Ionicons name="warning-outline" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardStatLabel}>
                {t("dashboard.stok_menipis")}
              </Text>
              <Text style={styles.cardStatValue}>{stats.stok_menipis}</Text>
            </View>
          </View>

          <View style={[styles.cardStat, styles.cardRed]}>
            <View style={styles.cardStatIcon}>
              <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.cardStatLabel}>
                {t("dashboard.stok_kritis")}
              </Text>
              <Text style={styles.cardStatValue}>{stats.stok_kritis}</Text>
            </View>
          </View>
        </View>

        {/* LIST BARANG */}
        <View style={styles.listHeader}>
          <View style={styles.listHeaderLeft}>
            <Ionicons name="list-outline" size={20} color="#0d47a1" />
            <Text style={styles.listTitle}>{t("dashboard.list_barang")}</Text>
          </View>
          <View style={styles.listBadge}>
            <Text style={styles.listBadgeText}>
              {filteredBarang.length} {t("dashboard.item")}
            </Text>
          </View>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder={t("dashboard.cari_barang")}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {filteredBarang.length === 0 ? (
          <View style={styles.emptyWrapper}>
            <Ionicons name="archive-outline" size={48} color="#d1d5db" />
            <Text style={styles.empty}>{t("dashboard.belum_ada_data")}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBarang}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const status =
                item.stok_akhir > 10
                  ? {
                      label: t("dashboard.tersedia"),
                      color: "#16a34a",
                      bg: "#dcfce7",
                    }
                  : item.stok_akhir > 5
                    ? {
                        label: t("dashboard.terbatas"),
                        color: "#d97706",
                        bg: "#fef9c3",
                      }
                    : {
                        label: t("dashboard.kritis"),
                        color: "#dc2626",
                        bg: "#fee2e2",
                      };

              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.nama}>{item.nama_barang}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: status.color }]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Ionicons
                          name="pricetag-outline"
                          size={14}
                          color="#94a3b8"
                        />
                        <Text style={styles.label}>{t("dashboard.kode")}</Text>
                      </View>
                      <Text style={styles.value}>{item.kode_barang}</Text>
                    </View>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Ionicons
                          name="cube-outline"
                          size={14}
                          color="#94a3b8"
                        />
                        <Text style={styles.label}>
                          {t("dashboard.stok_awal")}
                        </Text>
                      </View>
                      <Text style={styles.value}>{item.stok_awal}</Text>
                    </View>
                    <View style={styles.row}>
                      <View style={styles.rowLeft}>
                        <Ionicons
                          name="arrow-down-outline"
                          size={14}
                          color="#16a34a"
                        />
                        <Text style={styles.label}>
                          {t("dashboard.total_masuk")}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.value,
                          { color: "#16a34a", fontWeight: "600" },
                        ]}
                      >
                        +{item.total_masuk}
                      </Text>
                    </View>
                    <View style={[styles.row, styles.rowLast]}>
                      <View style={styles.rowLeft}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={14}
                          color="#2563eb"
                        />
                        <Text style={styles.label}>
                          {t("dashboard.stok_akhir")}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.value,
                          { fontWeight: "700", color: "#2563eb" },
                        ]}
                      >
                        {item.stok_akhir}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* FOOTER INFORMASI */}
        <View style={styles.footerInfo}>
          <View style={styles.footerRow}>
            <View style={styles.footerDotGreen} />
            <Text style={styles.footerText}>
              {t("dashboard.tersedia")} (&gt;10)
            </Text>
          </View>
          <View style={styles.footerRow}>
            <View style={styles.footerDotYellow} />
            <Text style={styles.footerText}>
              {t("dashboard.terbatas")} (5-10)
            </Text>
          </View>
          <View style={styles.footerRow}>
            <View style={styles.footerDotRed} />
            <Text style={styles.footerText}>
              {t("dashboard.kritis")} (&lt;5)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
  headerWrapper: { marginBottom: 20 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "400",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  cardStat: {
    width: "47%",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardStatLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 2,
  },
  cardStatValue: { fontSize: 24, fontWeight: "700", color: "#ffffff" },
  cardBlue: { backgroundColor: "#2563eb" },
  cardGreen: { backgroundColor: "#16a34a" },
  cardYellow: { backgroundColor: "#d97706" },
  cardRed: { backgroundColor: "#dc2626" },
  searchContainer: { marginBottom: 12 },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    color: "#0f172a",
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  listHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  listTitle: { fontSize: 17, fontWeight: "600", color: "#0f172a" },
  listBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 20,
  },
  listBadgeText: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
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
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  nama: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "600", letterSpacing: 0.2 },
  cardBody: { paddingTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  rowLast: { borderBottomWidth: 0 },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 13, color: "#94a3b8", fontWeight: "400" },
  value: { fontSize: 13, color: "#0f172a", fontWeight: "500" },
  emptyWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    gap: 8,
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "400",
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  footerDotYellow: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d97706",
  },
  footerDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  footerText: { fontSize: 11, color: "#64748b", fontWeight: "400" },
});
