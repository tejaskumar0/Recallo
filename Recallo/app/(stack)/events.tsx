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
// --- END CONSTANTS ---

// --- FONT MAPPING (Used internally to translate weights to names) ---
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
        // Adjusted paddingBottom so the last item isn't hidden behind the new Tab Bar
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            {/* The appTitle was removed, but the subtitle needs to be wrapped */}
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
  
  // --- HEADER STYLES (Copied from PeopleScreen) ---
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
    backgroundColor: palette.background, // Match screen background
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
    // FONT CHANGE: Replaced fontWeight: "800"
    fontFamily: 'Nunito-ExtraBold', 
    color: "#4A4036", 
    letterSpacing: -0.5,
  },
  // --- END HEADER STYLES ---

  scrollContent: {
    paddingBottom: 100,
    paddingTop: 12,
    paddingHorizontal: H_PADDING,
  },

  headerBlock: {
    marginBottom: 20,
  },
  appTitle: {
    display: 'none', // Hidden, replaced by headerTitle
  },
  appSubtitle: {
    fontSize: 15,
    // FONT CHANGE: Replaced default/no fontWeight (assumed Regular)
    fontFamily: 'Nunito-Regular', 
    color: palette.textSecondary,
    marginBottom: 16,
    paddingTop: 8,
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
    // FONT CHANGE: Replaced fontWeight: "700"
    fontFamily: 'Nunito-Bold', 
    flex: 1,
    marginRight: 8,
  },
  eventDate: {
    color: palette.textSecondary,
    fontSize: 13,
    // FONT CHANGE: Replaced default/no fontWeight (assumed Regular)
    fontFamily: 'Nunito-Regular', 
  },
  eventPerson: {
    color: palette.textSecondary,
    fontSize: 14,
    // FONT CHANGE: Replaced default/no fontWeight (assumed Regular)
    fontFamily: 'Nunito-Regular', 
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: CARD_RADIUS,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyText: {
    fontSize: 16,
    // FONT CHANGE: Replaced fontWeight: "700"
    fontFamily: 'Nunito-Bold', 
    color: palette.textPrimary,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    // FONT CHANGE: Replaced default/no fontWeight (assumed Regular)
    fontFamily: 'Nunito-Regular', 
    color: palette.textSecondary,
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