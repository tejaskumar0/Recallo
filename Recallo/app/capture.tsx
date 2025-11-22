import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Event, fetchEventsByUserAndFriend, fetchFriendsbyUser, Friend } from "../services/api";

// --- CONFIGURATION ---
const BACKEND_URL = "http://127.0.0.1:8000/api/v1/process_audio/"; 
const CURRENT_USER_ID = 'cf1acd40-f837-4d01-b459-2bce15fe061a';

const { width } = Dimensions.get("window");

export default function CaptureScreen() {
  const router = useRouter();
  
  // --- Data State ---
  const [friends, setFriends] = useState<Friend[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  
  // --- Selection State ---
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // --- Audio State ---
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [duration, setDuration] = useState(0);
  
  // --- UI State ---
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  // --- Animation Values ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;

  // ============================================================
  // 1. LOAD FRIENDS
  // ============================================================
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const data = await fetchFriendsbyUser(CURRENT_USER_ID);
        setFriends(data);
      } catch (error) {
        console.error("Error loading friends:", error);
      }
    };
    loadFriends();
  }, []);

  // ============================================================
  // 2. LOAD EVENTS (Dependant on Friend Selection)
  // ============================================================
  useEffect(() => {
    const loadEvents = async () => {
      if (selectedFriend?.id) {
        try {
          // Clear previous events first
          setEvents([]); 
          const data = await fetchEventsByUserAndFriend(CURRENT_USER_ID, selectedFriend.id);
          setEvents(data);
        } catch (error) {
          console.error("Error loading events:", error);
        }
      }
    };
    loadEvents();
  }, [selectedFriend]); // Triggers when the selected friend object changes


  // --- Audio Recording Logic ---

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        const perm = await requestPermission();
        if (perm.status !== 'granted') {
          Alert.alert("Permission required", "Please allow microphone access to record.");
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync( 
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setIsRecording(false);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); 
      
      setRecording(undefined);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      if (uri) {
        console.log('Recording stored at', uri);
        await uploadAudio(uri);
      }

    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  async function uploadAudio(uri: string) {
    if (!selectedFriend || !selectedEvent) {
      Alert.alert("Wait!", "Please select a friend and an event before saving.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // @ts-ignore
      formData.append('audio', {
        uri: uri,
        type: 'audio/m4a', 
        name: 'recording.m4a',
      });

      // Use selected object data for remarks
      const friendName = selectedFriend.friend_name;
      // @ts-ignore - handling generic Event type (check if your API returns .title or .name)
      const eventTitle = selectedEvent.title || selectedEvent.event_name || "Unknown Event";
      
      formData.append('remarks', `Context: ${friendName} - ${eventTitle}`);

      console.log("Uploading to:", BACKEND_URL);

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      
      console.log("------------------------------------------------");
      console.log("✅ MEMORY SAVED SUCCESSFULLY");
      console.log("Parsed Result:", JSON.stringify(result, null, 2));
      console.log("------------------------------------------------");

      Alert.alert("Success", "Memory analyzed and saved!");
      
    } catch (error) {
      console.error("Upload Failed:", error);
      Alert.alert("Upload Failed", "Could not connect to backend.");
    } finally {
      setIsUploading(false);
    }
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- Timer & Animation Logic ---

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      startPulse();
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      stopPulse();
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    const createBlobAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };
    createBlobAnimation(blob1Anim, 4000).start();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.setValue(1);
    pulseAnim.stopAnimation();
  };

  // Cleanup Fix
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]); 

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const blob1TranslateY = blob1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- Background Blobs --- */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: "#FFF8E1",
            top: -50,
            right: -50,
            transform: [{ translateY: blob1TranslateY }, { scale: 1.2 }],
          },
        ]}
      />

      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#4A4036" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Memory</Text>
        <View style={{ width: 48 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- Context Card --- */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHO IS THIS FOR?</Text>
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => {
                setShowPersonDropdown(!showPersonDropdown);
                setShowEventDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#FFECB3" }]}>
                <User size={20} color="#8D6E63" />
              </View>
              <Text style={styles.selectorText}>
                {selectedFriend ? selectedFriend.friend_name : "Select Friend"}
              </Text>
              <ChevronDown size={20} color="#D7CCC8" />
            </TouchableOpacity>

            {showPersonDropdown && (
              <View style={styles.dropdown}>
                {friends.length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>No friends found</Text>
                  </View>
                ) : (
                  friends.map((friend) => (
                    <TouchableOpacity 
                      key={friend.id} 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedFriend(friend);
                        setSelectedEvent(null); // Reset event when friend changes
                        setShowPersonDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{friend.friend_name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          <View style={{ height: 24 }} />

          <View style={[styles.inputGroup, { zIndex: -1 }]}>
            <Text style={styles.label}>WHAT&apos;S HAPPENING?</Text>
            <TouchableOpacity 
              style={styles.selectorButton}
              onPress={() => {
                if (!selectedFriend) {
                  Alert.alert("Please select a friend first");
                  return;
                }
                setShowEventDropdown(!showEventDropdown);
                setShowPersonDropdown(false);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#DCEDC8" }]}>
                <Calendar size={20} color="#558B2F" />
              </View>
              <Text style={styles.selectorText}>
                 {/* @ts-ignore - handling title or name */}
                {selectedEvent ? (selectedEvent.title || selectedEvent.event_name) : "Select Event"}
              </Text>
              <ChevronDown size={20} color="#D7CCC8" />
            </TouchableOpacity>

            {showEventDropdown && (
              <View style={styles.dropdown}>
                {events.length === 0 ? (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>
                        {selectedFriend ? "No events found" : "Select friend first"}
                    </Text>
                  </View>
                ) : (
                  events.map((event) => (
                    <TouchableOpacity 
                      key={event.id} 
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedEvent(event);
                        setShowEventDropdown(false);
                      }}
                    >
                      {/* @ts-ignore - handling title or name */}
                      <Text style={styles.dropdownText}>{event.event_name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>
        </View>

        {/* --- Recording Section --- */}
        <View style={styles.recorderSection}>
          <Text style={[
            styles.promptText, 
            isRecording && { color: "#FF6F00" }
          ]}>
            {isRecording ? "Listening..." : isUploading ? "Saving..." : "Tap to record"}
          </Text>

          <Text style={[
            styles.timerText, 
            { color: isRecording ? "#4A4036" : "#D7CCC8" }
          ]}>
            {isRecording ? formatTime(duration) : "0:00"}
          </Text>

          <View style={styles.micContainer}>
            <Animated.View style={[
              styles.pulseRing,
              {
                opacity: isRecording ? 0.3 : 0,
                transform: [{ scale: pulseAnim }],
              }
            ]} />
            
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: isRecording ? "#FF7043" : "#FFD54F" }
              ]}
              onPress={handleToggleRecording}
              disabled={isUploading}
              activeOpacity={0.9}
            >
              {isUploading ? (
                <ActivityIndicator color="white" size="large" />
              ) : isRecording ? (
                <Square fill="white" color="white" size={28} />
              ) : (
                <Mic color="#5D4037" size={36} strokeWidth={2.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* --- Footer --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.9}>
          <Text style={styles.saveButtonText}>Save Memory</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFCF4",
  },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 10,
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
    color: "#4A4036",
    letterSpacing: -0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    padding: 24,
    borderWidth: 2,
    borderColor: "#F5F1E0",
    shadowColor: "#E8E4D0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 40,
    zIndex: 20, 
  },
  inputGroup: {
    position: "relative",
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9C9480",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF5",
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0EAD6",
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#4A4036",
  },
  dropdown: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0EAD6",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 100,
    overflow: "hidden",
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F6EE",
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A4036",
  },
  recorderSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    zIndex: 1,
  },
  promptText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#A1887F",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 80,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    marginBottom: 40,
    letterSpacing: -2,
    includeFontPadding: false,
  },
  micContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 96,
    height: 96,
  },
  pulseRing: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#FF7043",
  },
  micButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFD54F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 10 : 24,
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#4A4036",
    height: 56,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A4036",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFF8E1",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});