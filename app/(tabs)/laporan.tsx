import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";
import api from "../../src/api";

export default function LaporanScreen() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-17");
  const [jenis, setJenis] = useState("semua");
  const [data, setData] = useState<any>(null);

  // ============================================
  // 1. AMBIL DATA DARI API
  // ============================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/laporan", {
        params: { start_date: startDate, end_date: endDate, jenis },
      });
      setData(res.data);
      Alert.alert("Berhasil", "Data laporan berhasil diambil");
    } catch (error) {
      Alert.alert("Error", "Gagal ambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 2. EXPORT PDF
  // ============================================
  const exportPdf = async () => {
    if (!data || !data.laporan || data.laporan.length === 0) {
      Alert.alert("Peringatan", "Ambil data laporan dulu!");
      return;
    }

    setExporting(true);
    try {
      // Bikin HTML
      const html = `
        <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #0d47a1; text-align: center; }
            p { text-align: center; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0d47a1; color: white; padding: 10px; text-align: left; }
            td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            tr:nth-child(even) { background: #f5f5f5; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>LAPORAN INVENTORY</h1>
          <p>PDAM Tirta Sago Kota Payakumbuh</p>
          <p>Periode: ${startDate} - ${endDate}</p>
          <table>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Nama Barang</th>
              <th>Jenis</th>
              <th>Jumlah</th>
              <th>Keterangan</th>
            </tr>
            ${data.laporan
              .map(
                (item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.tanggal}</td>
                <td>${item.kode}</td>
                <td>${item.nama}</td>
                <td>${item.jenis}</td>
                <td>${item.jumlah}</td>
                <td>${item.keterangan}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
          <div class="total">
            <p>Total Transaksi: ${data.total_transaksi}</p>
            <p>Total Barang Masuk: ${data.total_masuk}</p>
            <p>Total Barang Keluar: ${data.total_keluar}</p>
          </div>
        </body>
        </html>
      `;

      // Bikin PDF
      const { uri } = await Print.printToFileAsync({ html });

      // Baca file pake fetch + FileReader (biar bisa baca dari cache)
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Tulis ulang ke documentDirectory
      const newUri =
        FileSystem.documentDirectory + `laporan_${startDate}_${endDate}.pdf`;
      await FileSystem.writeAsStringAsync(newUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, {
          mimeType: "application/pdf",
          dialogTitle: "Share Laporan PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Berhasil", `PDF tersimpan di: ${newUri}`);
      }
    } catch (error: any) {
      Alert.alert("Error", "Gagal export PDF: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // 3. EXPORT EXCEL
  // ============================================
  const exportExcel = async () => {
    if (!data || !data.laporan || data.laporan.length === 0) {
      Alert.alert("Peringatan", "Ambil data laporan dulu!");
      return;
    }

    setExporting(true);
    try {
      // Bikin worksheet
      const ws = XLSX.utils.json_to_sheet(data.laporan);

      // Bikin workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");

      // Convert ke base64
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      // Simpan file
      const uri =
        FileSystem.documentDirectory + `laporan_${startDate}_${endDate}.xlsx`;
      await FileSystem.writeAsStringAsync(uri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Berhasil", `Excel tersimpan di: ${uri}`);
      }
    } catch (error: any) {
      Alert.alert("Error", "Gagal export Excel: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.card}>
          <Text style={styles.title}>📄 Laporan Inventory</Text>
          <Text style={styles.subtitle}>PDAM Tirta Sago</Text>
          <Text style={styles.period}>
            Periode: {startDate} - {endDate}
          </Text>
        </View>

        {/* Tombol Ambil Data */}
        <TouchableOpacity
          style={styles.button}
          onPress={fetchData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.buttonText}>Ambil Data Laporan</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Statistik */}
        {data && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📊 Statistik</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Total Transaksi</Text>
                <Text style={styles.value}>{data.total_transaksi || 0}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Barang Masuk</Text>
                <Text style={[styles.value, { color: "#16a34a" }]}>
                  {data.total_masuk || 0}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Barang Keluar</Text>
                <Text style={[styles.value, { color: "#dc2626" }]}>
                  {data.total_keluar || 0}
                </Text>
              </View>
            </View>

            {/* Tombol Export */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>📥 Export Laporan</Text>

              <TouchableOpacity
                style={[styles.exportButton, styles.pdfButton]}
                onPress={exportPdf}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="document-text" size={20} color="#fff" />
                    <Text style={styles.exportText}>Export PDF</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.exportButton, styles.excelButton]}
                onPress={exportExcel}
                disabled={exporting}
              >
                {exporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="grid" size={20} color="#fff" />
                    <Text style={styles.exportText}>Export Excel</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fa" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a1628",
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: "#64748b" },
  period: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  button: {
    backgroundColor: "#0d47a1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0a1628",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  label: { fontSize: 14, color: "#64748b" },
  value: { fontSize: 16, fontWeight: "700", color: "#0a1628" },
  exportButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  pdfButton: { backgroundColor: "#dc2626" },
  excelButton: { backgroundColor: "#16a34a" },
  exportText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
