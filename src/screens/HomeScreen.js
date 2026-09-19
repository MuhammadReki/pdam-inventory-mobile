import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../api";

export default function HomeScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi untuk mengambil data dari API
  const fetchBarang = async () => {
    try {
      const response = await api.get("/barang");
      setData(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengambil data! Pastikan server nyala.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Jalankan saat halaman pertama kali dibuka
  useEffect(() => {
    fetchBarang();
  }, []);

  // Fungsi untuk pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBarang();
  };

  // Tampilkan loading saat pertama kali
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Daftar Barang</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nama}>{item.nama_barang}</Text>
            <Text style={styles.kode}>Kode: {item.kode_barang}</Text>
            <Text style={styles.harga}>
              Harga: Rp {item.harga.toLocaleString("id-ID")}
            </Text>
            <Text style={styles.stok}>Stok: {item.stok}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data barang.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
  },
  nama: { fontSize: 18, fontWeight: "bold", color: "#222" },
  kode: { fontSize: 14, color: "#666", marginTop: 4 },
  harga: { fontSize: 16, fontWeight: "600", color: "#28a745", marginTop: 6 },
  stok: { fontSize: 14, color: "#333", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
