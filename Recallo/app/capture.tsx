import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { colors, spacing, radius, typography } from "../constants/theme";
import PersonSelector from "../components/PersonSelector";
import EventSelector from "../components/EventSelector";

export default function CaptureScreen() {
  const router = useRouter();
  const [person, setPerson] = useState("");
  const [eventName, setEventName] = useState("");
  const [notes, setNotes] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recordingLabel = isRecording ? "Recording… 00:05" : "Not recording";

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    // TODO: wire up actual audio recording with expo-av
  };

  const handleSave = () => {
    // TODO: actually save to backend
    console.log({ person, event: eventName, notes, isRecording });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New memory</Text>
          <View style={{ width: 24 }} />
        </View>

        <PersonSelector value={person} onChange={setPerson} />

        <EventSelector value={eventName} onChange={setEventName} />

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add quick notes..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.recordBox}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={toggleRecording}
            activeOpacity={0.85}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? "Stop" : "Record"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.recordStatus}>{recordingLabel}</Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: "600",
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: typography.body,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  recordBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    gap: spacing.sm,
  },
  recordButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  recordButtonText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: typography.body,
  },
  recordStatus: {
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  saveButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: "800",
    fontSize: typography.body,
  },
});
