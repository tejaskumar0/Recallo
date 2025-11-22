import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Event, fetchEventsByUser } from "../../services/api";

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

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      // Ensure this user ID is correct or replace with dynamic ID from AuthContext
      const data = await fetchEventsByUser(
        "cf1acd40-f837-4d01-b459-2bce15fe061a"
      );
      setEvents(data);
    };
    loadEvents();
  }, []);

  const formatFriendNames = (names: string[]) => {
    if (!names || names.length === 0) return "";
    if (names.length <= 3) return names.join(", ");
    const firstThree = names.slice(0, 3).join(", ");
    const remaining = names.length - 3;
    return `${firstThree} + ${remaining} others`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        // Adjusted paddingBottom so the last item isn't hidden behind the new Tab Bar
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 12,
          paddingHorizontal: H_PADDING,
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.appTitle}>Events</Text>
            <Text style={styles.appSubtitle}>Your timeline of moments.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/events/${item.id}` as any)}
          >
            <View style={styles.eventHeaderRow}>
              <Text style={styles.eventTitle}>{item.event_name}</Text>
              <Text style={styles.eventDate}>
                {item.event_date
                  ? new Date(item.event_date).toLocaleDateString()
                  : ""}
              </Text>
            </View>
            <Text style={styles.eventPerson}>
              with {formatFriendNames(item.friend_names)}
            </Text>
          </TouchableOpacity>
        )}
      />
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
});
