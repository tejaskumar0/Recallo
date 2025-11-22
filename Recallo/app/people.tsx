// app/people.tsx
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

const MOCK_PEOPLE = [
  { id: "1", name: "John Tan", lastSpoken: "21 Nov 2025", eventsCount: 3 },
  { id: "2", name: "Sarah Lim", lastSpoken: "20 Nov 2025", eventsCount: 2 },
  { id: "3", name: "Michael Lee", lastSpoken: "15 Nov 2025", eventsCount: 1 },
];

const palette = {
  background: "#f0e9cfff",
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

export default function PeopleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_PEOPLE}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 140 }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personRow}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/people/[id]",
                params: { id: item.id, name: item.name },
              })
            }
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.personName}>{item.name}</Text>
              <Text style={styles.personMeta}>
                {item.eventsCount} events • last on {item.lastSpoken}
              </Text>
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

  personRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    padding: spacing.md,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarLetter: {
    color: palette.textPrimary,
    fontWeight: "700",
  },
  personName: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  personMeta: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
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
    backgroundColor: "#a39f8dff",
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
