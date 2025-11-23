import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native"; // Use Lucide icon for consistency
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../../contexts/AuthContext";
import { Event, fetchEventsByUserAndFriend } from "../../../services/api";

// --- CONSTANTS ---
const palette = {
  background: "#f2efe0ff",
  // UI IMPROVEMENT: Changed card color to pure white for consistency
  card: "#FFFFFF",
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  // UI IMPROVEMENT: Slightly darker border for better contrast on white cards
  border: "rgba(0, 0, 0, 0.08)",
};

const shadow = {
  // UI IMPROVEMENT: Consistent shadow definition
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const CARD_RADIUS = 20; // UI IMPROVEMENT: Slightly larger radius
const H_PADDING = 24;
// --- END CONSTANTS ---

// NOTE: The getFontFamily helper function has been removed as requested.

export default function PersonEventsScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const personId = Array.isArray(id) ? id[0] : id ?? "";
  const personName = Array.isArray(name) ? name[0] : name ?? "Person";

  useEffect(() => {
    const loadEvents = async () => {
      console.log("working");
      if (personId && user?.id) {
        try {
          setLoading(true);
          const data = await fetchEventsByUserAndFriend(user.id, personId);
          setEvents(data);
        } catch (error) {
          console.error("Error loading events:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadEvents();
  }, [personId, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={palette.textPrimary}
              />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{personName}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <Image
              source={require("../../../assets/images/loader.gif")}
              style={styles.loader}
              resizeMode="contain"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* UI IMPROVEMENT: Cleaned up Header Block */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            {/* UI IMPROVEMENT: Using Lucide icon for visual consistency */}
            <ArrowLeft size={24} color="#4A4036" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{personName}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          // UI IMPROVEMENT: Tighter spacing between items
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events recorded yet.</Text>
              <Text style={styles.emptySubText}>
                Start a new conversation with {personName}!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.eventCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/content/[user]/[friend]/[event]",
                  params: {
                    user: user?.id ?? "",
                    friend: personId,
                    event: item.id,
                  },
                })
              }
            >
              <View style={styles.eventHeaderRow}>
                <Text style={styles.eventTitle}>{item.event_name}</Text>
                <Text style={styles.eventDate}>
                  {item.event_date
                    ? new Date(item.event_date).toLocaleDateString()
                    : ""}
                </Text>
              </View>
              {/* Optional: Add a brief summary here if available */}
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingVertical: 0,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F0EAD6",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: palette.textPrimary,
    // FONT CHANGE: Hardcoded 'Nunito-ExtraBold' (was 800)
    fontFamily: "Nunito-ExtraBold",
    fontSize: 24,
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventTitle: {
    color: palette.textPrimary,
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    flex: 1,
    marginRight: 10,
  },
  eventDate: {
    color: palette.textSecondary,
    // FONT CHANGE: Hardcoded 'Nunito-Regular'
    fontFamily: "Nunito-Regular",
    fontSize: 13,
    paddingTop: 2,
  },
  // --- Empty State Styles ---
  emptyContainer: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: CARD_RADIUS,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyText: {
    // FONT CHANGE: Hardcoded 'Nunito-SemiBold' (was 600)
    fontFamily: "Nunito-SemiBold",
    color: palette.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    // FONT CHANGE: Hardcoded 'Nunito-Regular' (was 400)
    fontFamily: "Nunito-Regular",
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.background,
  },
  loader: {
    width: "100%",
    height: "100%",
  },
});
