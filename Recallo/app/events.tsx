// app/events.tsx
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius, typography } from "../constants/theme";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Lunch at NUS",
    person: "John Tan",
    date: "21 Nov 2025",
    topics: ["career", "travel"],
  },
  {
    id: "2",
    title: "Sprint planning",
    person: "Sarah Lim",
    date: "20 Nov 2025",
    topics: ["work", "deadlines"],
  },
  {
    id: "3",
    title: "Catch-up call",
    person: "Michael Lee",
    date: "15 Nov 2025",
    topics: ["family"],
  },
];

export default function EventsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/")}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← Home</Text>
            </TouchableOpacity>
      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard} activeOpacity={0.85}>
            <View style={styles.eventHeaderRow}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
            </View>
            <Text style={styles.eventPerson}>with {item.person}</Text>
            <View style={styles.topicRow}>
              {item.topics.map((topic) => (
                <View key={topic} style={styles.topicChip}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
    backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: "transparent",
  },
   backButtonText: {
    fontSize: typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  eventDate: {
    color: colors.textSecondary,
    fontSize: typography.small,
  },
  eventPerson: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginBottom: spacing.sm,
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  topicChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  topicText: {
    color: colors.accent,
    fontSize: typography.small,
  },
});