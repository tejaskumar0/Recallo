// app/people.tsx
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

const MOCK_PEOPLE = [
  { id: "1", name: "John Tan", lastSpoken: "21 Nov 2025", eventsCount: 3 },
  { id: "2", name: "Sarah Lim", lastSpoken: "20 Nov 2025", eventsCount: 2 },
  { id: "3", name: "Michael Lee", lastSpoken: "15 Nov 2025", eventsCount: 1 },
];

export default function PeopleScreen() {
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
        data={MOCK_PEOPLE}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: spacing.md }}
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

  personRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarLetter: {
    color: colors.accent,
    fontWeight: "700",
  },
  personName: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "600",
  },
  personMeta: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
});
