import { useRouter } from "expo-router";
import { ChevronLeft, Lock, Users } from "lucide-react-native";
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
import { Friend, fetchEventsByUserAndFriend, fetchFriendsbyUser } from "../../services/api";

const palette = {
  background: "#f2efe0ff",
  card: "#FFFFFF",
  textPrimary: "#2b2100",
  textSecondary: "#6b623f",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.08)",
  disabled: "#e0e0e0",
  success: "#4caf50",
  error: "#f44336"
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

export default function QuizScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendEventCounts, setFriendEventCounts] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadFriendsData = async () => {
      try {
        const friendsData = await fetchFriendsbyUser(user.id);
        setFriends(friendsData);
        
        // Fetch event counts for each friend
        const eventCounts: { [key: string]: number } = {};
        await Promise.all(
          friendsData.map(async (friend) => {
            const events = await fetchEventsByUserAndFriend(user.id, friend.id);
            eventCounts[friend.id] = events.length;
          })
        );
        setFriendEventCounts(eventCounts);
      } catch (err) {
        console.error("Error loading friends:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFriendsData();
  }, [user?.id]);

  const handleFriendSelect = (friendId: string) => {
    const eventCount = friendEventCounts[friendId] || 0;
    if (eventCount >= 2) {
      router.push(`/quiz/${friendId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Friend</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.instructions}>
          Choose a friend to test your memory about your conversations. 
          You need at least 2 events with a friend to take a quiz.
        </Text>

        <View style={styles.friendsContainer}>
          {friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color={palette.textSecondary} />
              <Text style={styles.emptyStateText}>No friends found</Text>
              <Text style={styles.emptyStateSubtext}>
                Start capturing conversations to add friends
              </Text>
            </View>
          ) : (
            friends.map((friend) => {
              const eventCount = friendEventCounts[friend.id] || 0;
              const isEligible = eventCount >= 2;
              
              return (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendCard,
                    !isEligible && styles.friendCardDisabled
                  ]}
                  onPress={() => handleFriendSelect(friend.id)}
                  disabled={!isEligible}
                  activeOpacity={0.8}
                >
                  <View style={styles.friendInfo}>
                    <Text style={[
                      styles.friendName,
                      !isEligible && styles.friendNameDisabled
                    ]}>
                      {friend.friend_name}
                    </Text>
                    <Text style={[
                      styles.eventCount,
                      !isEligible && styles.eventCountDisabled,
                      eventCount >= 2 && styles.eventCountSuccess
                    ]}>
                      {eventCount} {eventCount === 1 ? 'event' : 'events'}
                    </Text>
                  </View>
                  {!isEligible && (
                    <View style={styles.lockIcon}>
                      <Lock size={20} color={palette.textSecondary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: palette.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  instructions: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  friendsContainer: {
    gap: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    ...shadow,
  },
  friendCardDisabled: {
    backgroundColor: palette.disabled,
    opacity: 0.7,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  friendNameDisabled: {
    color: palette.textSecondary,
  },
  eventCount: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
  },
  eventCountDisabled: {
    color: palette.textSecondary,
  },
  eventCountSuccess: {
    color: palette.success,
  },
  lockIcon: {
    marginLeft: 12,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: palette.textPrimary,
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: palette.textSecondary,
  },
});