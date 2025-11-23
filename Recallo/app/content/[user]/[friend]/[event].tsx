import { useRouter, useLocalSearchParams } from "expo-router";
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
import { ArrowLeft } from 'lucide-react-native'; // Using Lucide icon for consistency

// --- CONSTANTS ---
const palette = {
  background: "#f2efe0ff",
  // UI IMPROVEMENT: Changed card color to pure white
  card: "#FFFFFF", 
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  // UI IMPROVEMENT: Darker border for contrast
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

const CARD_RADIUS = 20; // UI IMPROVEMENT: Larger radius
const H_PADDING = 24;
// --- END CONSTANTS ---

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
            {/* UI IMPROVEMENT: Using Lucide icon for consistency */}
            <ArrowLeft size={24} color="#4A4036" />
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
            <Text style={styles.emptyText}>No content available for this memory.</Text>
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
    paddingTop: 0, 
    paddingVertical: 16,
  },
  
  // --- HEADER STYLES ---
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    // UI IMPROVEMENT: Reduced margin below header
    marginBottom: 16,
    paddingTop: 16, // Added top padding
  },
  backButton: {
    // UI IMPROVEMENT: Consistent back button style
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
    // FONT CHANGE: Hardcoded 'Nunito-ExtraBold' (was 700)
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24, // UI IMPROVEMENT: Larger title
  },
  headerSpacer: {
    width: 40,
  },
  
  // --- LIST & CARD STYLES ---
  listContainer: {
    gap: 12, // UI IMPROVEMENT: Tighter gap between cards
    paddingTop: 12, // Space after the subtitle/header row
  },
  card: {
    backgroundColor: palette.card, // UI IMPROVEMENT: Now #FFFFFF
    borderRadius: CARD_RADIUS,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border, // UI IMPROVEMENT: Darker border
    ...shadow,
  },
  topicTitle: {
    color: palette.textPrimary,
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    marginBottom: 6, // UI IMPROVEMENT: Reduced space
  },
  topicContent: {
    color: palette.textSecondary,
    // FONT CHANGE: Hardcoded 'Nunito-Regular' (was default)
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  
  // --- EMPTY STATE ---
  emptyText: {
    color: palette.textSecondary,
    // FONT CHANGE: Hardcoded 'Nunito-Regular' (was default)
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
    fontStyle: 'italic',
  },
});