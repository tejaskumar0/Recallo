// app/events.tsx
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import { spacing } from "../constants/theme";

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

const palette = {
  background: "#e9dfb7ff",
  card: "#fff8d8",
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.05)",
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.16,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

const CARD_RADIUS = 18;
const H_PADDING = 24;

function BottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const currentPath = segments.length ? `/${segments.join("/")}` : "/";
  const tabs: { key: "Home" | "People" | "Events"; path: "/" | "/people" | "/events" }[] = [
    { key: "Home", path: "/" },
    { key: "People", path: "/people" },
    { key: "Events", path: "/events" },
  ];

  return (
    <SafeAreaView style={styles.bottomNavSafeArea}>
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
                activeOpacity={0.85}
                onPress={() => router.push(tab.path)}
              >
                <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>
                  {tab.key}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_EVENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: spacing.sm }}
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
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: H_PADDING,
    paddingVertical: spacing.lg,
  },
  eventCard: {
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  eventTitle: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  eventDate: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  eventPerson: {
    color: palette.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  topicChip: {
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: CARD_RADIUS / 2,
  },
  topicText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomNavSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomNavWrapper: {
    alignItems: "center",
    paddingBottom: 12,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#bab6a7ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...shadow,
  },
  bottomNavItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  bottomNavItemActive: {
    backgroundColor: "#ffffff",
  },
  bottomNavLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
  },
  bottomNavLabelActive: {
    color: palette.textPrimary,
    fontWeight: "800",
  },
});
