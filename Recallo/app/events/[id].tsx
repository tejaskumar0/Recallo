import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { fetchFriendsByUserAndEvent, Friend } from "../../services/api";

// --- CONSTANTS ---
const palette = {
  background: "#f2efe0ff",
  card: "#FFFFFF",
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.08)",
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const CARD_RADIUS = 20;
const H_PADDING = 24;
// --- END CONSTANTS ---

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id, eventName } = useLocalSearchParams();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  const eventId = Array.isArray(id) ? id[0] : id ?? "";
  const screenTitle = Array.isArray(eventName)
    ? eventName[0]
    : eventName ?? "Event Details";

  useEffect(() => {
    const loadFriends = async () => {
      if (eventId && user?.id) {
        try {
          setLoading(true);
          const data = await fetchFriendsByUserAndEvent(user.id, eventId);
          setFriends(data);
          console.log(data);
        } catch (error) {
          console.error("Error loading friends:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadFriends();
  }, [eventId, user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Image
            source={require("../../assets/images/loader.gif")}
            style={styles.loader}
            resizeMode="contain"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#4A4036" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{screenTitle}</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* --- People Section (Replaced Chips with Cards) --- */}
        <View style={styles.section}>
          {/* UI IMPROVEMENT: Changed title to 'People' */}
          <Text style={styles.sectionTitle}>People</Text>

          <View style={styles.peopleContainerGrid}>
            {friends && friends.length > 0 ? (
              friends.map((friend, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.personCard} // UI IMPROVEMENT: Uses new card style
                  onPress={() =>
                    router.push({
                      pathname: "/content/[user]/[friend]/[event]",
                      params: {
                        user: user?.id ?? "",
                        friend: friend.id,
                        event: eventId,
                      },
                    })
                  }
                  activeOpacity={0.9}
                >
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {friend.friend_name
                        ? friend.friend_name[0].toUpperCase()
                        : "?"}
                    </Text>
                  </View>
                  <Text style={styles.personName}>{friend.friend_name}</Text>

                  {/* NOTE: Event count data isn't available in the Friend object fetched here, 
                            so we use a fixed label to maintain UI structure. */}
                  <Text style={styles.eventLabel}>View Memory</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyTextFullWidth}>
                No people associated with this event.
              </Text>
            )}
          </View>
        </View>

        {/* UI IMPROVEMENT: Removed the unnecessary "Memories" section */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 40,
    paddingTop: 0,
  },

  // --- HEADER STYLES ---
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24, // Increased space below header
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
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: palette.textPrimary,
    fontFamily: "Nunito-ExtraBold",
    fontSize: 24,
  },
  headerSpacer: {
    width: 40,
  },

  // --- LOADING/EMPTY STYLES ---
  loadingText: {
    color: palette.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    textAlign: "center",
    marginTop: 40,
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    fontStyle: "italic",
  },
  emptyTextFullWidth: {
    // Used inside the grid container when empty
    width: "100%",
    color: palette.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },

  // --- SECTION STYLES ---
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Nunito-Bold",
    color: palette.textPrimary,
    marginBottom: 16,
  },

  // --- SQUARE CARD STYLES (New UI) ---
  peopleContainerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  personCard: {
    width: "48%", // Two-column grid
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 15,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    color: palette.textPrimary,
    fontSize: 24,
    fontFamily: "Nunito-ExtraBold",
  },
  personName: {
    color: palette.textPrimary,
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  eventLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    opacity: 0.8,
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
