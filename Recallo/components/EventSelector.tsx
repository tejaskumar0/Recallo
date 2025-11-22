import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing, radius, typography } from "../constants/theme";

const EVENTS = ["Coffee chat", "Sprint planning", "Project sync"];

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function EventSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [draft, setDraft] = useState("");
  const anim = useRef(new Animated.Value(0)).current;

  const options = useMemo(() => EVENTS, []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [open, anim]);

  const handleSelect = (item: string) => {
    onChange(item);
    setOpen(false);
  };

  const handleAddNew = () => {
    setAddingNew(true);
    setOpen(false);
    setTimeout(() => setDraft(""), 0);
  };

  const handleSubmitNew = () => {
    if (!draft.trim()) return;
    onChange(draft.trim());
    setAddingNew(false);
  };

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  if (addingNew) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>Event</Text>
        <TextInput
          style={styles.input}
          placeholder="Add a new event"
          placeholderTextColor={colors.textSecondary}
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            onChange(text);
          }}
          onSubmitEditing={handleSubmitNew}
          returnKeyType="done"
        />
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>Event</Text>
      <TouchableOpacity
        style={styles.selector}
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
      >
        <Text style={styles.selectorText}>
          {value ? value : "What was the occasion?"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none">
        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setOpen(false)} activeOpacity={1}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: anim,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Choose an event</Text>
            <ScrollView
              style={{ maxHeight: 320 }}
              contentContainerStyle={{ paddingVertical: spacing.xs }}
              showsVerticalScrollIndicator={false}
            >
              {options.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.optionRow}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.optionRow} onPress={handleAddNew}>
                <Text style={[styles.optionText, styles.optionAdd]}>➕ Add new event</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.small,
    fontWeight: "600",
  },
  selector: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorText: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: typography.subtitle,
    marginBottom: spacing.sm,
  },
  optionRow: {
    paddingVertical: spacing.sm,
  },
  optionText: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  optionAdd: {
    color: colors.accent,
    fontWeight: "700",
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
});
