import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import api from "../../src/api";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLanguage } from "../../src/context/LanguageContext";

export default function MasukScreen() {
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    barang_id: "",
    jumlah: "",
    tanggal_masuk: "",
    keterangan: "",
  });

  const [barangList, setBarangList] = useState([]);

  const fetchBarangMasuk = async () => {
    try {
      const response = await api.get("/barang-masuk");
      setData(response.data.data);
      setFilteredData(response.data.data);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(t("common.error"), t("common.gagal"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchBarangOptions = async () => {
    try {
      const response = await api.get("/barang");
      setBarangList(response.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchBarangMasuk();
    fetchBarangOptions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBarangMasuk();
    fetchBarangOptions();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.barang.nama_barang.toLowerCase().includes(text.toLowerCase()) ||
          item.barang.kode_barang.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredData(data);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleAdd = async () => {
    if (!form.barang_id || !form.jumlah || !form.tanggal_masuk) {
      Alert.alert(t("common.error"), t("masuk.field_wajib"));
      return;
    }
    try {
      await api.post("/barang-masuk", {
        barang_id: parseInt(form.barang_id),
        jumlah: parseInt(form.jumlah),
        tanggal_masuk: form.tanggal_masuk,
        keterangan: form.keterangan || null,
      });
      Alert.alert(t("common.sukses"), t("masuk.sukses_tambah"));
      resetForm();
      closeModal();
      fetchBarangMasuk();
      fetchBarangOptions();
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("common.gagal"),
      );
    }
  };

  const handleEdit = async () => {
    if (!form.barang_id || !form.jumlah || !form.tanggal_masuk) {
      Alert.alert(t("common.error"), t("masuk.field_wajib"));
      return;
    }
    try {
      await api.put(`/barang-masuk/${selectedId}`, {
        barang_id: parseInt(form.barang_id),
        jumlah: parseInt(form.jumlah),
        tanggal_masuk: form.tanggal_masuk,
        keterangan: form.keterangan || null,
      });
      Alert.alert(t("common.sukses"), t("masuk.sukses_edit"));
      resetForm();
      closeModal();
      fetchBarangMasuk();
      fetchBarangOptions();
    } catch (error) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("common.gagal"),
      );
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      t("masuk.konfirmasi_hapus"),
      `${t("masuk.yakin_hapus")} "${name}"?`,
      [
        { text: t("common.batal"), style: "cancel" },
        {
          text: t("common.hapus"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/barang-masuk/${id}`);
              Alert.alert(t("common.sukses"), t("masuk.sukses_hapus"));
              fetchBarangMasuk();
              fetchBarangOptions();
            } catch (error) {
              Alert.alert(t("common.error"), t("common.gagal"));
            }
          },
        },
      ],
    );
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm({
      barang_id: "",
      jumlah: "",
      tanggal_masuk: new Date().toISOString().split("T")[0],
      keterangan: "",
    });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setSelectedId(item.id);
    setForm({
      barang_id: item.barang_id.toString(),
      jumlah: item.jumlah.toString(),
      tanggal_masuk: item.tanggal_masuk,
      keterangan: item.keterangan || "",
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({ barang_id: "", jumlah: "", tanggal_masuk: "", keterangan: "" });
    setIsEditing(false);
    setSelectedId(null);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>📥 {t("masuk.title")}</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {filteredData.length} {t("masuk.transaksi")}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

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

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563eb"]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.nama}>{item.barang.nama_barang}</Text>
              <View style={styles.jumlahBadge}>
                <Ionicons name="add-circle-outline" size={14} color="#2563eb" />
                <Text style={styles.jumlahBadgeText}>+{item.jumlah}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                  <Text style={styles.label}>{t("masuk.tanggal")}</Text>
                </View>
                <Text style={styles.value}>
                  {formatDate(item.tanggal_masuk)}
                </Text>
              </View>
              {item.keterangan && (
                <View style={[styles.row, styles.rowLast]}>
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name="clipboard-outline"
                      size={14}
                      color="#94a3b8"
                    />
                    <Text style={styles.label}>{t("masuk.ket")}</Text>
                  </View>
                  <Text
                    style={[
                      styles.value,
                      { fontStyle: "italic", color: "#64748b" },
                    ]}
                  >
                    {item.keterangan}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(item)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
                <Text style={styles.btnText}>{t("common.edit")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.barang.nama_barang)}
              >
                <Ionicons name="trash" size={16} color="#fff" />
                <Text style={styles.btnText}>{t("common.hapus")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Ionicons name="archive-outline" size={48} color="#94a3b8" />
            <Text style={styles.empty}>{t("masuk.belum_ada_data")}</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={isEditing ? "pencil-outline" : "add-circle-outline"}
                size={24}
                color="#2563eb"
              />
              <Text style={styles.modalTitle}>
                {isEditing ? t("masuk.edit") : t("masuk.tambah")}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>{t("masuk.pilih_barang")}</Text>
              <View style={styles.pickerWrapper}>
                {barangList.length === 0 ? (
                  <View style={styles.emptyPickerWrapper}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={24}
                      color="#94a3b8"
                    />
                    <Text style={styles.emptyPickerText}>
                      {t("masuk.belum_ada_barang")}
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    {barangList.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerItem,
                          form.barang_id === item.id.toString() &&
                            styles.pickerItemSelected,
                        ]}
                        onPress={() =>
                          setForm({ ...form, barang_id: item.id.toString() })
                        }
                      >
                        <Text
                          style={[
                            styles.pickerText,
                            form.barang_id === item.id.toString() &&
                              styles.pickerTextSelected,
                          ]}
                        >
                          {item.kode_barang} - {item.nama_barang} (
                          {t("barang.stok")}: {item.stok})
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              <Text style={styles.inputLabel}>{t("masuk.jumlah")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={form.jumlah}
                  onChangeText={(text) => setForm({ ...form, jumlah: text })}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={styles.inputLabel}>{t("masuk.tanggal")}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={form.tanggal_masuk}
                  onChangeText={(text) =>
                    setForm({ ...form, tanggal_masuk: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <Text style={styles.inputLabel}>{t("masuk.keterangan")}</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperTextArea]}>
                <Ionicons
                  name="clipboard-outline"
                  size={18}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={form.keterangan}
                  onChangeText={(text) =>
                    setForm({ ...form, keterangan: text })
                  }
                  placeholder={t("common.opsional")}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>{t("common.batal")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={isEditing ? handleEdit : handleAdd}
                >
                  <Text style={styles.saveBtnText}>
                    {isEditing ? t("barang.update") : t("common.simpan")}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
  headerWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    flexShrink: 1,
  },
  headerBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
    flexShrink: 0,
  },
  headerBadgeText: { fontSize: 10, fontWeight: "600", color: "#2563eb" },
  addButton: {
    backgroundColor: "#2563eb",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    flexShrink: 0,
    marginLeft: 6,
  },
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
  nama: { fontSize: 17, fontWeight: "600", color: "#0f172a", flex: 1 },
  jumlahBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  jumlahBadgeText: { color: "#2563eb", fontSize: 14, fontWeight: "700" },
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#d97706",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    gap: 4,
  },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  emptyWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "400",
  },
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
    width: "92%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
  },
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
  inputWrapperTextArea: { alignItems: "flex-start", paddingTop: 10 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: "#0f172a" },
  textArea: { minHeight: 80, textAlignVertical: "top", paddingTop: 8 },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    maxHeight: 150,
    padding: 4,
  },
  pickerItem: { padding: 10, borderRadius: 8, marginVertical: 2 },
  pickerItemSelected: { backgroundColor: "#dbeafe" },
  pickerText: { fontSize: 14, color: "#0f172a" },
  pickerTextSelected: { color: "#2563eb", fontWeight: "600" },
  emptyPickerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 6,
  },
  emptyPickerText: { textAlign: "center", color: "#94a3b8", fontSize: 14 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: "#64748b", fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#ffffff", fontWeight: "600" },
});
