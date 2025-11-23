import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { fetchFriendsbyUser, Friend } from "../../services/api";

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

type CustomHeaderProps = {
  router: ReturnType<typeof useRouter>;
  styles: { [key: string]: any };
};

const CustomHeader = ({ router, styles }: CustomHeaderProps) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <ArrowLeft size={24} color="#4A4036" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>People</Text>
    <View style={{ width: 48 }} />
  </View>
);
// --- End Header Component ---

export default function PeopleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFriends = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const data = await fetchFriendsbyUser(user.id);
          console.log("loading", loading)
          setFriends(data);
        } catch (error) {
          console.error("Error loading friends:", error);
        } finally {
          setLoading(false);
          console.log("loading", loading)
        }
      }
    };
    loadFriends();
  }, [user?.id]);

  // UI IMPROVEMENT: Helper function for Empty Component
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No friends added yet.</Text>
      <Text style={styles.emptySubText}>
        Add a friend when you capture a new memory!
      </Text>
    </View>
  );
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader router={router} styles={styles} />
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
      <CustomHeader router={router} styles={styles} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.appSubtitle}>Your circle of friends.</Text>
        </View>

        {/* UI IMPROVEMENT: Reverted to Grid structure for two columns */}
        <View style={styles.grid}>
          {friends.length === 0
            ? renderEmptyComponent()
            : friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.card}
                  onPress={() => router.push(`/people/${friend.id}` as any)}
                  activeOpacity={0.9}
                >
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {friend.friend_name
                          ? friend.friend_name[0].toUpperCase()
                          : "?"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {friend.friend_name}
                  </Text>
                  <View style={styles.stats}>
                    <Text style={styles.statText}>
                      {friend.event_count}{" "}
                      {friend.event_count === 1 ? "Event" : "Events"}
                    </Text>
                    {friend.last_event_date ? (
                      <Text style={styles.statSubtext}>
                        Last:{" "}
                        {new Date(friend.last_event_date).toLocaleDateString()}
                      </Text>
                    ) : (
                      <Text style={styles.statSubtext}>No Recent Events</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },

  // --- HEADER STYLES ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
    backgroundColor: palette.background,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#F0EAD6",
    elevation: 2,
    shadowColor: "#E8E4D0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Nunito-ExtraBold",
    color: "#4A4036",
    letterSpacing: -0.5,
  },
  // --- END HEADER STYLES ---

  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 0,
    paddingBottom: 100,
  },
  headerBlock: {
    // UI IMPROVEMENT: Minimal spacing from subtitle to grid
    marginBottom: 16,
    paddingTop: 12,
  },
  appTitle: {
    display: "none",
  },
  appSubtitle: {
    fontSize: 15,
    fontFamily: "Nunito-Regular",
    color: palette.textSecondary,
    marginBottom: 0, // UI IMPROVEMENT: Let grid handle spacing
    paddingBottom: 8, // UI IMPROVEMENT: Added bottom padding for space above grid
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // UI IMPROVEMENT: Reduced gap to 10px to fit cards better
    gap: 10,
  },
  card: {
    // UI IMPROVEMENT: Back to two columns, using 48% to leave 4% for the middle gap
    width: "48%",
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    // UI IMPROVEMENT: Reduced padding for tighter card design
    padding: 15,
    alignItems: "center",
    // UI IMPROVEMENT: Using 10px vertical margin to match horizontal gap
    marginBottom: 10,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  avatarContainer: {
    // UI IMPROVEMENT: Less space below avatar
    marginBottom: 8,
  },
  avatarPlaceholder: {
    // UI IMPROVEMENT: Smaller avatar size to fit card
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  avatarText: {
    color: palette.textPrimary,
    // UI IMPROVEMENT: Smaller font size
    fontSize: 24,
    fontFamily: "Nunito-ExtraBold",
  },
  name: {
    color: palette.textPrimary,
    // UI IMPROVEMENT: Font size reduced slightly
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    marginBottom: 4, // UI IMPROVEMENT: Less space below name
    textAlign: "center",
  },
  stats: {
    alignItems: "center",
    marginTop: 4,
  },
  statText: {
    color: palette.textSecondary,
    fontSize: 13, // UI IMPROVEMENT: Smaller stat text
    fontFamily: "Nunito-SemiBold", // UI IMPROVEMENT: Slightly bolder than regular
    marginBottom: 1,
  },
  statSubtext: {
    color: palette.textSecondary,
    fontSize: 11, // UI IMPROVEMENT: Smaller subtext
    fontFamily: "Nunito-Regular",
    marginTop: 2,
    opacity: 0.8,
  },
  // --- Empty State Styles ---
  emptyContainer: {
    // UI IMPROVEMENT: Full width when empty
    width: "100%",
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: CARD_RADIUS,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    color: palette.textPrimary,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: palette.textSecondary,
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
