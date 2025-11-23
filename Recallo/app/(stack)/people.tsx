import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFriendsbyUser, Friend } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react-native';

// --- CONSTANTS ---
const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff", // Used for cards/grid items
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
    <Text style={styles.headerTitle}>People</Text>
    <View style={{ width: 48 }} />
  </View>
);
// --- End Header Component ---


export default function PeopleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      if (user?.id) {
        try {
          const data = await fetchFriendsbyUser(user.id);
          setFriends(data);
        } catch (error) {
          console.error("Error loading friends:", error);
        }
      }
    };
    loadFriends();
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Use the isolated header component */}
      <CustomHeader router={router} styles={styles} />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.appSubtitle}>
            Your circle of friends.
          </Text>
        </View>

        <View style={styles.grid}>
          {friends.map((friend) => (
            <TouchableOpacity 
              key={friend.id} 
              style={styles.card}
              onPress={() => router.push(`/people/${friend.id}` as any)}
              activeOpacity={0.9}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {friend.friend_name ? friend.friend_name[0] : '?'}
                  </Text>
                </View>
              </View>
              <Text style={styles.name} numberOfLines={1}>{friend.friend_name}</Text>
              <View style={styles.stats}>
                <Text style={styles.statText}>{friend.event_count} Events</Text>
                {friend.last_event_date ? (
                  <Text style={styles.statSubtext}>
                    Last: {new Date(friend.last_event_date).toLocaleDateString()}
                  </Text>
                ) : null}
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
  
  // --- HEADER STYLES (New) ---
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
    fontWeight: "800",
    color: "#4A4036", // Use dark brown for visibility
    letterSpacing: -0.5,
  },
  // --- END HEADER STYLES ---

  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 100,
  },
  headerBlock: {
    marginBottom: 28,
  },
  appTitle: {
    // This title is now redundant with headerTitle, so we just hide it
    display: 'none', 
  },
  appSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 16,
    paddingTop: 8, // Adjust spacing
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: '47%',
    backgroundColor: palette.card,
    borderRadius: CARD_RADIUS,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
  name: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  stats: {
    alignItems: 'center',
  },
  statText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  statSubtext: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
});