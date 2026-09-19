import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import JSZip from "jszip";
import api from "../api";

const BACKUP_FILENAME = "PDAM_Backup";
const CACHE_KEY = "@pdam_backup_info";

// ===== FOLDER BACKUP DI HP =====
const BACKUP_DIR = FileSystem.documentDirectory + "PDAM_Backup/";

// ===== FUNGSI BACKUP DATA =====
export const backupData = async () => {
  try {
    // 1. Bikin folder kalo belum ada
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
    }

    // 2. Ambil data dari API
    const [barangRes, masukRes, keluarRes] = await Promise.all([
      api.get("/barang").catch(() => ({ data: { data: [] } })),
      api.get("/barang-masuk").catch(() => ({ data: { data: [] } })),
      api.get("/barang-keluar").catch(() => ({ data: { data: [] } })),
    ]);

    // 3. Bikin object backup
    const backupPayload = {
      app: "PDAM Inventory",
      version: "1.0",
      created_at: new Date().toISOString(),
      data: {
        barang: barangRes.data.data || [],
        barang_masuk: masukRes.data.data || [],
        barang_keluar: keluarRes.data.data || [],
      },
    };

    // 4. Bikin file ZIP
    const zip = new JSZip();
    zip.file("backup-data.json", JSON.stringify(backupPayload, null, 2));
    zip.file(
      "README.txt",
      `PDAM Inventory Backup\n=====================\n\nDibuat: ${new Date().toLocaleString(
        "id-ID",
      )}\n\nTotal Data:\n- Barang: ${backupPayload.data.barang.length}\n- Barang Masuk: ${backupPayload.data.barang_masuk.length}\n- Barang Keluar: ${backupPayload.data.barang_keluar.length}\n`,
    );

    const zipContent = await zip.generateAsync({ type: "base64" });

    // 5. Bikin nama file dengan timestamp
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")
      .replace("T", "_");
    const zipFilename = `${BACKUP_FILENAME}_${timestamp}.zip`;

    // 6. Path final
    const finalPath = BACKUP_DIR + zipFilename;

    // 7. Simpan file ZIP
    await FileSystem.writeAsStringAsync(finalPath, zipContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 8. Simpan info backup ke AsyncStorage
    const backupInfo = {
      filename: zipFilename,
      path: finalPath,
      created_at: backupPayload.created_at,
      counts: {
        barang: backupPayload.data.barang.length,
        barang_masuk: backupPayload.data.barang_masuk.length,
        barang_keluar: backupPayload.data.barang_keluar.length,
      },
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(backupInfo));

    const fileInfo = await FileSystem.getInfoAsync(finalPath);

    return {
      success: true,
      filename: zipFilename,
      path: finalPath,
      size: fileInfo.size,
      created_at: backupPayload.created_at,
      counts: backupInfo.counts,
    };
  } catch (error) {
    console.error("Backup error:", error);
    return { success: false, error: error.message };
  }
};

// ===== FUNGSI RESTORE DATA =====
export const restoreData = async () => {
  try {
    const infoStr = await AsyncStorage.getItem(CACHE_KEY);
    if (!infoStr) {
      return {
        success: false,
        error: "Belum ada backup. Lakukan backup terlebih dahulu.",
      };
    }

    const info = JSON.parse(infoStr);
    const fileInfo = await FileSystem.getInfoAsync(info.path);

    if (!fileInfo.exists) {
      return {
        success: false,
        error: "File backup tidak ditemukan di HP.",
      };
    }

    const zipContent = await FileSystem.readAsStringAsync(info.path, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const zip = await JSZip.loadAsync(zipContent, { base64: true });
    const jsonFile = zip.file("backup-data.json");
    if (!jsonFile) {
      return { success: false, error: "File backup korup / tidak valid." };
    }

    const jsonContent = await jsonFile.async("string");
    const backupPayload = JSON.parse(jsonContent);

    if (!backupPayload.data) {
      return { success: false, error: "Format backup tidak valid!" };
    }

    return {
      success: true,
      data: backupPayload.data,
      created_at: backupPayload.created_at,
      counts: {
        barang: backupPayload.data.barang?.length || 0,
        barang_masuk: backupPayload.data.barang_masuk?.length || 0,
        barang_keluar: backupPayload.data.barang_keluar?.length || 0,
      },
    };
  } catch (error) {
    console.error("Restore error:", error);
    return { success: false, error: error.message };
  }
};

// ===== FUNGSI HAPUS CACHE =====
export const hapusCache = async () => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(BACKUP_DIR, { idempotent: true });
    }

    await AsyncStorage.removeItem(CACHE_KEY);

    return { success: true };
  } catch (error) {
    console.error("Hapus cache error:", error);
    return { success: false, error: error.message };
  }
};

// ===== FUNGSI CEK INFO BACKUP =====
export const getBackupInfo = async () => {
  try {
    const infoStr = await AsyncStorage.getItem(CACHE_KEY);
    if (!infoStr) {
      return { exists: false };
    }

    const info = JSON.parse(infoStr);
    const fileInfo = await FileSystem.getInfoAsync(info.path);

    if (!fileInfo.exists) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return { exists: false };
    }

    const sizeKB = (fileInfo.size / 1024).toFixed(2);

    return {
      exists: true,
      filename: info.filename,
      size: sizeKB,
      created_at: info.created_at,
      path: info.path,
      counts: info.counts,
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
};
