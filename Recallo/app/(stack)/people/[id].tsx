import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Event, fetchEventsByUserAndFriend } from '../../../services/api';

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

import { useAuth } from '../../../contexts/AuthContext';

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
      console.log("working")
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
              <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{personName}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.loadingContainer}>
            <Image 
              source={require('../../../assets/images/loader.gif')} 
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
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
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
          ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No events recorded yet.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.eventCard}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: "/content/[user]/[friend]/[event]",
                params: { 
                  user: user?.id ?? '',
                  friend: personId,
                  event: item.id 
                }
              })}
            >
              <View style={styles.eventHeaderRow}>
                <Text style={styles.eventTitle}>{item.event_name}</Text>
                <Text style={styles.eventDate}>
                  {item.event_date ? new Date(item.event_date).toLocaleDateString() : ''}
                </Text>
              </View>
              {/* We can show summary or other details here if available in the future */}
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
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSpacer: {
    width: 40, // Approximate width of back button to balance center title
  },
  listContent: {
    paddingBottom: 24,
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
    marginBottom: 4,
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
  emptyText: {
    color: palette.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
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
