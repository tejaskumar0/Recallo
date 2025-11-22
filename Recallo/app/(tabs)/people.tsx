import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchFriendsbyUser, Friend } from '../../services/api';

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

export default function PeopleScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      // Replace static ID with dynamic user ID when ready
      const data = await fetchFriendsbyUser('cf1acd40-f837-4d01-b459-2bce15fe061a');
      setFriends(data);
    };
    loadFriends();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.appTitle}>People</Text>
          <Text style={styles.appSubtitle}>
            Your circle of friends.
          </Text>
        </View>

        <View style={styles.grid}>
          {friends.map((friend) => (
            <TouchableOpacity 
              key={friend.id} 
              style={styles.card}
              // This points to app/(stack)/people/[id].tsx
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
                {friend.last_event_date && (
                  <Text style={styles.statSubtext}>
                    Last: {new Date(friend.last_event_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    // Add extra padding at bottom so content isn't hidden behind the floating tab bar
    paddingBottom: 100,
  },
  headerBlock: {
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 16,
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