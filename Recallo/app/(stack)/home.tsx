import { Link, useRouter } from "expo-router";
import { Brain, CalendarDays, Mic, Users } from "lucide-react-native";
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
import { Event, Friend, fetchEventsByUser, fetchFriendsbyUser } from "../../services/api";

// --- CONSTANT DECLARATIONS ---
const palette = {
  background: "#f2efe0ff",
  card: "#FFFFFF",
  textPrimary: "#2b2100", // Dark Brown
  textSecondary: "#6b623f", // Medium Brown
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

const CARD_RADIUS = 24;
const H_PADDING = 24;
// --- END CONSTANTS ---

// --- Custom Components for Invitation (RecordFAB) ---

const fabPalette = {
  button: "#FFD54F", // Yellow/Gold
  mic: "#5D4037", // Brown text/icon
};

function RecordFAB({ router }: { router: any }) {
  return (
    <View style={fabStyles.container}> 
      <TouchableOpacity
        style={fabStyles.micButton}
        activeOpacity={0.8}
        onPress={() => router.push("/capture")}
      >
        <Mic color={fabPalette.mic} size={36} strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={fabStyles.labelText}>
        Start Capture
      </Text>
    </View>
  );
}

const fabStyles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    bottom: 30,
    transform: [{ translateX: -60 }],
    width: 120, 
    height: 140,
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: fabPalette.button,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  labelText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Bold', 
    color: palette.textPrimary,
    textAlign: 'center',
  },
});

// --- Main Screen ---

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const userId = user.id;
        const [eventsData, friendsData] = await Promise.all([
          fetchEventsByUser(userId),
          fetchFriendsbyUser(userId),
        ]);
        setEvents(eventsData);
        setFriends(friendsData);
      } catch (err) {
        console.error("Error loading home data:", err);
      }
    };

    load();
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Image 
            source={require("../../assets/images/logo pic.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appSubtitle}>
            Capture conversations. Remember the important bits.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          
          <Link href="/people" asChild>
            <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8}> 
              <Users size={30} color={palette.textPrimary} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>View Friends</Text> 
                <Text style={styles.actionSubtitle}>See profiles and key relationships.</Text> 
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/events" asChild>
            <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8}>
              <CalendarDays size={30} color={palette.textPrimary} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Browse by Events</Text>
                <Text style={styles.actionSubtitle}>Timeline of memories, meetings, and activities.</Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/quiz" asChild>
            <TouchableOpacity style={styles.actionBlock} activeOpacity={0.8}>
              <Brain size={30} color={palette.textPrimary} style={styles.actionIcon} />
              <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Take a Quiz</Text>
                  <Text style={styles.actionSubtitle}>Test your memory on recent conversations.</Text>
              </View>
            </TouchableOpacity>
          </Link>

        </View>

        <View style={{ height: 120 }} />

      </ScrollView>

      <RecordFAB router={router} />
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
    paddingTop: 12,
    paddingBottom: 120, 
  },
  headerBlock: {
    marginBottom: 50, 
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 14, 
    fontFamily: 'Nunito-SemiBold', 
    color: palette.textSecondary,
    marginBottom: 4,
  },
  logo: {
    height: 120,
    width: "100%",
    alignSelf: 'flex-start', // Align with text
    marginVertical: 24,
  },
  appSubtitle: {
    fontSize: 24, 
    fontFamily: 'Nunito-Regular', 
    color: palette.textSecondary,
    padding: 8,
    lineHeight: 22,
  },
  
  actionContainer: {
    gap: 16,
  },
  actionBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 18, 
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...shadow,
  },
  actionIcon: {
    marginRight: 16,
    opacity: 0.85,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: palette.textPrimary,
    fontFamily: 'Nunito-ExtraBold', 
    fontSize: 20, 
    marginBottom: 4,
  },
  actionSubtitle: {
    color: palette.textSecondary,
    fontSize: 14, 
    fontFamily: 'Nunito-Regular', 
    lineHeight: 18,
  },
  
  calendarRow: { display: "none" },
  navRow: { display: "none" },
  section: { display: "none" },
  fab: { display: "none" }, 
});