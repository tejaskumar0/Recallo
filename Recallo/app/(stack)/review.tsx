import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Check, Hash, PenLine, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MemoryBlock {
  topic: string;
  content: string;
}

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- 1. SMART PARSING ---
  // We expect structure: { "topics": [ { "topic": "...", "content": "..." } ] }
  let initialBlocks: MemoryBlock[] = [];

  try {
    const raw = params.data ? JSON.parse(params.data as string) : {};
    
    if (Array.isArray(raw.topics)) {
      initialBlocks = raw.topics.map((item: any) => ({
        topic: item.topic || "Untitled Topic",
        content: item.content || "",
      }));
    } else {
      // Fallback if data is empty or different format
      initialBlocks = [{ topic: "New Memory", content: "" }];
    }
  } catch (e) {
    console.error("Parsing Error", e);
    initialBlocks = [{ topic: "New Memory", content: "" }];
  }

  const [blocks, setBlocks] = useState<MemoryBlock[]>(initialBlocks);

  // --- HANDLERS ---

  // Update specific field (topic or content) at specific index
  const updateBlock = (index: number, field: keyof MemoryBlock, text: string) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: text };
    setBlocks(newBlocks);
  };

  // Add a completely new card
  const addNewBlock = () => {
    setBlocks([...blocks, { topic: "", content: "" }]);
  };

  // Delete a card
  const deleteBlock = (index: number) => {
    if (blocks.length === 1) {
      Alert.alert("Cannot delete", "You must have at least one memory block.");
      return;
    }
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
  };

  // Save everything
  const handleFinalSave = () => {
    const finalJSON = {
      topics: blocks
    };

    console.log("------------------------------------------------");
    console.log("💾 FINAL SAVED DATA:");
    console.log(JSON.stringify(finalJSON, null, 2));
    console.log("------------------------------------------------");

    router.dismissAll();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4A4036" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Memory</Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* RENDER LIST OF CARDS */}
          {blocks.map((block, index) => (
            <View key={index} style={styles.card}>
              
              {/* Card Header: Topic Title */}
              <View style={styles.cardHeader}>
                <View style={styles.headerIconBox}>
                  <Hash size={16} color="#8D6E63" />
                </View>
                <TextInput 
                  style={styles.topicInput}
                  value={block.topic}
                  onChangeText={(text) => updateBlock(index, 'topic', text)}
                  placeholder="Topic Name..."
                  placeholderTextColor="#D7CCC8"
                />
                <TouchableOpacity onPress={() => deleteBlock(index)} style={styles.deleteButton}>
                  <Trash2 size={18} color="#D7CCC8" />
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Card Body: Content */}
              <View style={styles.cardBody}>
                <View style={styles.bodyLabelRow}>
                  <PenLine size={12} color="#9C9480" />
                  <Text style={styles.bodyLabel}>CONTENT</Text>
                </View>
                <TextInput
                  style={styles.contentInput}
                  value={block.content}
                  onChangeText={(text) => updateBlock(index, 'content', text)}
                  multiline
                  placeholder="Write details here..."
                  placeholderTextColor="#E0E0E0"
                />
              </View>
            </View>
          ))}

          {/* Add New Section Button */}
          <TouchableOpacity style={styles.addButton} onPress={addNewBlock}>
            <Plus size={20} color="#8D6E63" />
            <Text style={styles.addButtonText}>Add Another Topic</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleFinalSave} activeOpacity={0.9}>
            <Text style={styles.saveButtonText}>Confirm & Save</Text>
            <View style={styles.checkIcon}>
               <Check size={18} color="#4A4036" strokeWidth={3} />
            </View>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFCF4" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingVertical: 16 },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#F0EAD6" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#4A4036" },
  
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  
  // --- CARD STYLES ---
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#F5F1E0",
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: "#E8E4D0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1", // Light yellow header
    padding: 16,
  },
  headerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFE082",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topicInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#5D4037",
  },
  deleteButton: {
    padding: 8,
  },
  
  divider: { height: 2, backgroundColor: "#F9F6EE" },
  
  cardBody: {
    padding: 16,
  },
  bodyLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  bodyLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9C9480",
    letterSpacing: 1.2,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A4036",
    minHeight: 80,
    textAlignVertical: "top",
  },

  // --- ADD BUTTON ---
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F0EAD6",
    borderStyle: 'dashed',
    marginBottom: 40,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#8D6E63",
  },

  // --- FOOTER ---
  footer: { padding: 24, backgroundColor: "#FDFCF4" },
  saveButton: { flexDirection: "row", backgroundColor: "#4A4036", height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", gap: 12 },
  saveButtonText: { color: "#FFF8E1", fontSize: 20, fontWeight: "bold" },
  checkIcon: { backgroundColor: "#FFD54F", width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});