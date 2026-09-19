import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "expo-router/react-navigation";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../../src/api";
import { useAuth } from "../../src/context/AuthContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export default function AiChatScreen() {
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      text:
        "Halo bro! Gue asisten inventory PDAM Tirta Sago. " +
        "Tanya apa aja soal stok, barang masuk/keluar, atau kondisi gudang. 🔥",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    Keyboard.dismiss();

    try {
      const res = await api.post("/ai/chat", {
        message: userMsg.text,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: res.data.reply || "Maaf, gue nggak dapet jawaban.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        text:
          "Aduh, koneksi ke AI bermasalah. Coba lagi ya bro. " +
          (error.response?.data?.detail || ""),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowUser : styles.bubbleRowAI,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarAI}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        )}
        <View
          style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}
        >
          <Text style={isUser ? styles.textUser : styles.textAI}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight + 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>AI lagi mikir...</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Tanya apa aja soal gudang..."
            placeholderTextColor="#9aa7b4"
            editable={!loading}
            multiline
            color="#1f2d3d"
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.5 }]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f6fa" },
  listContent: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowAI: { justifyContent: "flex-start" },
  avatarAI: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  bubble: {
    maxWidth: "78%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: "#007bff",
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#e3ebf3",
  },
  textUser: { color: "#fff", fontSize: 14, lineHeight: 20 },
  textAI: { color: "#1f2d3d", fontSize: 14, lineHeight: 20 },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 8,
  },
  loadingText: { color: "#7a8a99", fontSize: 12, fontStyle: "italic" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e3ebf3",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: "#f2f6fa",
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2d3d",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
});
