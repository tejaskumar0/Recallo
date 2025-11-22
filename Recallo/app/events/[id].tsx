import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchFriendsByUserAndEvent, Friend } from "../../services/api";

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

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [friends, setFriends] = useState<Friend[]>([]);

  const eventId = Array.isArray(id) ? id[0] : id ?? "";

  useEffect(() => {
    const loadFriends = async () => {
      if (eventId) {
        const data = await fetchFriendsByUserAndEvent('cf1acd40-f837-4d01-b459-2bce15fe061a', eventId);
        setFriends(data);
        console.log(data);
      }
    };
    loadFriends();
  }, [eventId]);

  if (!friends) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>People</Text>
          <View style={styles.peopleContainer}>
            {friends && friends.length > 0 ? (
              friends.map((friend, index) => (
                <View key={index} style={styles.personChip}>
                  <Text style={styles.personName}>{friend.friend_name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No people associated with this event.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
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
    width: 40,
  },
  loadingText: {
    color: palette.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  titleBlock: {
    marginBottom: 32,
  },
  eventDate: {
    fontSize: 16,
    color: palette.textSecondary,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 12,
  },
  peopleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  personChip: {
    backgroundColor: palette.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  personName: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
