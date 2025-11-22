import { router, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Event, fetchEventsByUser } from '../services/api';

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
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEventsByUser('cf1acd40-f837-4d01-b459-2bce15fe061a');
      setEvents(data);
    };
    loadEvents();
  }, []);

  const formatFriendNames = (names: string[]) => {
    if (!names || names.length === 0) return '';
    if (names.length <= 3) return names.join(', ');
    const firstThree = names.slice(0, 3).join(', ');
    const remaining = names.length - 3;
    return `${firstThree} + ${remaining} others`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 12, paddingHorizontal: H_PADDING }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.appTitle}>Events</Text>
            <Text style={styles.appSubtitle}>
              Your timeline of moments.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventCard} activeOpacity={0.85} onPress={() => router.push(`/events/${item.id}`)}>
            <View style={styles.eventHeaderRow}>
              <Text style={styles.eventTitle}>{item.event_name}</Text>
              <Text style={styles.eventDate}>
                {item.event_date ? new Date(item.event_date).toLocaleDateString() : ''}
              </Text>
            </View>
            <Text style={styles.eventPerson}>
              with {formatFriendNames(item.friend_names)}
            </Text>
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
  },
  headerBlock: {
    marginBottom: 20,
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
  eventCard: {
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 15,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  eventPerson: {
    color: palette.textSecondary,
    fontSize: 14,
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
