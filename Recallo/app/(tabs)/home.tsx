import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useEffect, useState, useMemo } from "react";
import { Event, fetchEventsByUser } from "../../services/api";
import { colors, spacing, radius, typography } from "../../constants/theme";

const MOCK_PEOPLE = [
  { id: "1", name: "John Tan", lastEvent: "Coffee chat about job search" },
  { id: "2", name: "Sarah Lim", lastEvent: "Project sync" },
];

function WeekCalendar() {
  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  }, []);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <View style={styles.calendarRow}>
      {weekDays.map((date) => {
        const isToday = isSameDay(date, today);
        const label = date.toLocaleDateString("en-US", { weekday: "short" });
        return (
          <View
            key={date.toISOString()}
            style={[
              styles.dayPill,
              isToday ? styles.dayPillActive : styles.dayPillInactive,
            ]}
          >
            <Text style={[styles.dayName, isToday && styles.dayNameActive]}>
              {label}
            </Text>
            <Text style={[styles.dayNumber, isToday && styles.dayNumberActive]}>
              {date.getDate()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);

  const formatFriendNames = (names: string[] | null) => {
    if (!names || names.length === 0) return "";
    if (names.length <= 3) return names.join(", ");
    const firstThree = names.slice(0, 3).join(", ");
    const remaining = names.length - 3;
    return `${firstThree} + ${remaining} others`;
  };

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEventsByUser(
        "cf1acd40-f837-4d01-b459-2bce15fe061a"
      );
      console.log("EVENTS FROM API:", data);
      setEvents(data);
    };
    loadEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.appTitle}>Recallo</Text>
          <Text style={styles.appSubtitle}>
            Capture conversations. Remember the important bits.
          </Text>
          <WeekCalendar />

          <View style={styles.navRow}>
            <Link href="/people" asChild>
              <TouchableOpacity style={styles.navButton} activeOpacity={0.9}>
                <Text style={styles.navButtonLabel}>By People</Text>
                <Text style={styles.navButtonSub}>View all people</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/events" asChild>
              <TouchableOpacity style={styles.navButton} activeOpacity={0.9}>
                <Text style={styles.navButtonLabel}>By Event</Text>
                <Text style={styles.navButtonSub}>Browse events</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* People section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
            <Link href="/people">
              <Text style={styles.sectionAction}>See all</Text>
            </Link>
          </View>
          <FlatList
            data={MOCK_PEOPLE}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <View style={styles.personCard}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={2}>
                  Last event: {item.lastEvent}
                </Text>
              </View>
            )}
          />
        </View>

        {/* Recent events (from backend) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            <Link href="/events">
              <Text style={styles.sectionAction}>See all</Text>
            </Link>
          </View>

          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.event_name}</Text>

                  <Text style={styles.cardSubtitle}>
                    {formatFriendNames(item.friend_names)} •{" "}
                    {item.event_date
                      ? new Date(item.event_date).toLocaleDateString()
                      : "No date"}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* Floating + button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/capture")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff",
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.05)",
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
};

const CARD_RADIUS = 18;
const H_PADDING = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 140,
  },
  headerBlock: {
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 16,
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dayPill: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  dayPillActive: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
  },
  dayPillInactive: {
    backgroundColor: "rgba(255,255,255,0.35)",
    borderColor: "rgba(255,255,255,0.5)",
  },
  dayName: {
    fontSize: 11,
    color: palette.textSecondary,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textPrimary,
  },
  dayNameActive: {
    color: palette.textPrimary,
    fontWeight: "600",
  },
  dayNumberActive: {
    color: palette.textPrimary,
    fontWeight: "800",
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  navButtonLabel: {
    color: palette.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 6,
  },
  navButtonSub: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  section: {
    marginTop: 12,
    marginBottom: 26,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: "600",
  },
  personCard: {
    width: 200,
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 6,
  },
  cardSubtitle: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  fab: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    right: H_PADDING,
    // Kept high to avoid overlapping with the floating tab bar
    bottom: 120, 
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabText: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    marginTop: -2,
  },
});