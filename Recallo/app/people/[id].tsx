import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { colors, spacing, radius, typography } from "../../constants/theme";

const MOCK_EVENTS = [
  {
    id: "e1",
    personId: "1",
    title: "Lunch at NUS",
    date: "21 Nov 2025",
    summary: "Talked about job search",
  },
  {
    id: "e2",
    personId: "1",
    title: "Sprint planning",
    date: "10 Nov 2025",
    summary: "Project sync",
  },
  {
    id: "e3",
    personId: "2",
    title: "Coffee chat",
    date: "20 Nov 2025",
    summary: "Catch up",
  },
];

export default function PersonEventsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();

  const personId = Array.isArray(id) ? id[0] : id ?? "";
  const personName = Array.isArray(name) ? name[0] : name ?? "Person";

  const personEvents = MOCK_EVENTS.filter((event) => event.personId === personId);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{personName}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={personEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events recorded yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventMeta}>{item.date}</Text>
              <Text style={styles.eventSummary}>{item.summary}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingRight: spacing.md,
    paddingLeft: spacing.xs,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "700",
  },
  headerSpacer: {
    width: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  eventMeta: {
    color: colors.textSecondary,
    fontSize: typography.small,
    marginBottom: spacing.xs,
  },
  eventSummary: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
