import { useRouter } from "expo-router";
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';
import { Event, fetchEventsByUser } from "../../services/api";


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
  shadowColor: "#000",
  // UI IMPROVEMENT: Increased shadow definition
  shadowOpacity: 0.1, 
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const CARD_RADIUS = 20; // UI IMPROVEMENT: Slightly larger radius for softer look
const H_PADDING = 24;
// --- END CONSTANTS ---

// --- FONT MAPPING (Used internally to translate weights to names) ---
// Kept for reference but not used in styles
const getFontFamily = (weight: string | number): string => {
  switch (String(weight)) {
    case '600':
      return 'Nunito-SemiBold';
    case '700':
      return 'Nunito-Bold';
    case '800':
      return 'Nunito-ExtraBold';
    default:
      return 'Nunito-Regular';
  }
};
// --- END FONT MAPPING ---


type CustomHeaderProps = {
  router: ReturnType<typeof useRouter>;
  styles: { [key: string]: any };
};

const CustomHeader = ({ router, styles }: CustomHeaderProps) => (
  <View style={styles.header}>
    <TouchableOpacity 
      onPress={() => router.back()} 
      style={styles.backButton}
    >
      <ArrowLeft size={24} color="#4A4036" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Events</Text>
    <View style={{ width: 48 }} />
  </View>
);

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const data = await fetchEventsByUser(user.id);
          setEvents(data);
        } catch (error) {
          console.error("Error loading events:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadEvents();
  }, [user?.id]);

  const formatFriendNames = (names: string[]) => {
    if (!names || names.length === 0) return "No participants";
    if (names.length <= 3) return names.join(", ");
    const firstThree = names.slice(0, 3).join(", ");
    const remaining = names.length - 3;
    return `${firstThree} + ${remaining} others`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader router={router} styles={styles} />
        <View style={styles.loadingContainer}>
          <Image 
            source={require('../../assets/images/loader.gif')} 
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
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.appSubtitle}>Your timeline of moments.</Text>
          </View>
        }
        // UI IMPROVEMENT: Slightly larger gap between list items
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />} 
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
                  : "No Date"}
              </Text>
            </View>
            <Text style={styles.eventPerson}>
              with {formatFriendNames(item.friend_names)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No events recorded yet.</Text>
                <Text style={styles.emptySubText}>Start by tapping the microphone on the Home screen!</Text>
            </View>
        }
      />
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
    fontFamily: 'Nunito-ExtraBold', 
    color: "#4A4036", 
    letterSpacing: -0.5,
  },
  // --- END HEADER STYLES ---

  scrollContent: {
    paddingBottom: 100,
    // UI IMPROVEMENT: Removed vertical padding from here
    paddingTop: 0, 
    paddingHorizontal: H_PADDING,
  },

  headerBlock: {
    // UI IMPROVEMENT: Reduced top margin
    marginBottom: 16, 
    // UI IMPROVEMENT: Added padding to control space to header
    paddingTop: 12, 
  },
  appTitle: {
    display: 'none',
  },
  appSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Regular', 
    color: palette.textSecondary,
    // UI IMPROVEMENT: Reduced bottom margin
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: palette.card, // UI IMPROVEMENT: Now #FFFFFF
    borderRadius: CARD_RADIUS,
    // UI IMPROVEMENT: Increased internal padding
    padding: 20, 
    borderWidth: 1,
    borderColor: palette.border, // UI IMPROVEMENT: Now darker border
    ...shadow, // UI IMPROVEMENT: Stronger shadow
  },
  eventHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // UI IMPROVEMENT: Reduced vertical space
    marginBottom: 6, 
  },
  eventTitle: {
    color: palette.textPrimary,
    // UI IMPROVEMENT: Larger, bolder title
    fontSize: 18, 
    fontFamily: 'Nunito-ExtraBold', 
    flex: 1,
    marginRight: 10,
  },
  eventDate: {
    color: palette.textSecondary,
    // UI IMPROVEMENT: Slightly smaller date text
    fontSize: 12, 
    fontFamily: 'Nunito-Regular', 
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  eventPerson: {
    color: palette.textSecondary,
    fontSize: 14,
    fontFamily: 'Nunito-Regular', 
    // UI IMPROVEMENT: Tighter line height
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: palette.card, // Use white card color
    borderRadius: CARD_RADIUS,
    marginTop: 20,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold', 
    color: palette.textPrimary,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular', 
    color: palette.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  loader: {
    width: '100%',
    height: '100%',
  },
});