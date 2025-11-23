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
import { Content, fetchContentByUserFriendEventId, fetchUserFriendEventId } from "../../../../services/api";

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

export default function ContentDetailsScreen() {
  const router = useRouter();
  const { user, friend, event } = useLocalSearchParams();
  const [contentList, setContentList] = useState<Content[]>([]);

  const userId = Array.isArray(user) ? user[0] : user ?? "";
  const friendId = Array.isArray(friend) ? friend[0] : friend ?? "";
  const eventId = Array.isArray(event) ? event[0] : event ?? "";

  useEffect(() => {
    const loadContent = async () => {
      if (userId && friendId && eventId) {
        // 1. Get the user_friend_event_id
        const userFriendEventId = await fetchUserFriendEventId(userId, friendId, eventId);
        
        if (userFriendEventId) {
          // 2. Fetch content using that ID
          const data = await fetchContentByUserFriendEventId(userFriendEventId);
          setContentList(data);
        }
      }
    };
    loadContent();
  }, [userId, friendId, eventId]);

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
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Conversation Topics</Text>
          </View>
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.listContainer}>
          {contentList && contentList.length > 0 ? (
            contentList.map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.topicTitle}>{item.topic}</Text>
                <Text style={styles.topicContent}>{item.content}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No content available.</Text>
          )}
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
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  topicTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  topicContent: {
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    fontStyle: 'italic',
  },
});
