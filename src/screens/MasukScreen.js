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

export default function MasukScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBarangMasuk = async () => {
    try {
      const response = await api.get("/barang-masuk");
      setData(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengambil data!");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBarangMasuk();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBarangMasuk();
  };

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
      <Text style={styles.title}>📥 Barang Masuk</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nama}>{item.barang.nama_barang}</Text>
            <Text style={styles.jumlah}>Jumlah: {item.jumlah}</Text>
            <Text style={styles.tanggal}>Tanggal: {item.tanggal_masuk}</Text>
            <Text style={styles.keterangan}>
              Keterangan: {item.keterangan || "-"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada data barang masuk.</Text>
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
  jumlah: { fontSize: 16, fontWeight: "600", color: "#007bff", marginTop: 4 },
  tanggal: { fontSize: 14, color: "#666", marginTop: 4 },
  keterangan: { fontSize: 14, color: "#333", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 16 },
});
