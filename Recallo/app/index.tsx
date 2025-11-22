// app/index.tsx
import { Link, useRouter, useSegments } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useMemo } from "react";

const MOCK_PEOPLE = [
  { id: "1", name: "John Tan", lastEvent: "Coffee chat about job search" },
  { id: "2", name: "Sarah Lim", lastEvent: "Project sync" },
];

const MOCK_EVENTS = [
  { id: "1", title: "Lunch at NUS", person: "John Tan", date: "21 Nov 2025" },
  { id: "2", title: "Sprint planning", person: "Sarah Lim", date: "20 Nov 2025" },
];

type TabKey = "Home" | "People" | "Events";

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
            <Text
              style={[styles.dayNumber, isToday && styles.dayNumberActive]}
            >
              {date.getDate()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
function BottomNav() {
  const router = useRouter();
  const segments = useSegments();
  const currentPath = segments.length ? `/${segments.join("/")}` : "/";
  const tabs: { key: TabKey; path: "/" | "/people" | "/events" }[] = [
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

export default function HomeScreen() {
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Events</Text>
            <Link href="/events">
              <Text style={styles.sectionAction}>See all</Text>
            </Link>
          </View>
          <FlatList
            data={MOCK_EVENTS}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={styles.eventRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {item.person} • {item.date}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>

      <BottomNav />
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
    backgroundColor: "#cdc4a1ff",
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
