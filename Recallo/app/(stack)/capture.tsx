import { Audio } from 'expo-av';
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown, Mic, Plus, Square, User, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { Event, fetchEventsByUser, fetchFriendsbyUser, Friend } from "../../services/api";
import { API_URL } from "../../config/api";

// --- CONFIGURATION ---
const API_BASE = API_URL;
const AUDIO_PROCESS_URL = `${API_BASE}/process_audio/`; 
const FRIENDS_URL = `${API_BASE}/friends/`;
const EVENTS_URL = `${API_BASE}/events/`;
const USER_FRIENDS_URL = `${API_BASE}/relations/user-friends/`;
const USER_EVENTS_URL = `${API_BASE}/relations/user-events/`;
const USER_FRIENDS_EVENTS_URL = `${API_BASE}/relations/user-friends-events/`;

// NOTE: The getFontFamily helper function and font mapping have been removed as requested.


export default function CaptureScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
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

  // --- Modal State ---
  const [isFriendModalVisible, setIsFriendModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newEventName, setNewEventName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // --- Animation Values ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;

  // ============================================================
  // 1. LOAD FRIENDS
  // ============================================================
  useEffect(() => {
    if (user?.id) {
      loadFriends();
    }
  }, [user?.id]);

  const loadFriends = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchFriendsbyUser(user.id);
      console.log(data)
      setFriends(data);
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  // ============================================================
  // 2. LOAD EVENTS (Dependant on USER only)
  // ============================================================
  useEffect(() => {
    const loadEvents = async () => {
      if (selectedFriend?.id) {
        try {
          setEvents([]); 
          if (user?.id) {
            const data = await fetchEventsByUser(user.id);
            setEvents(data);
          }
        } catch (error) {
          console.error("Error loading events:", error);
        }
      } else {
        setEvents([]);
      }
    };
    loadEvents();
  }, [selectedFriend]);


  // ============================================================
  // 3. CREATE LOGIC
  // ============================================================

  const handleCreateFriend = async () => {
    if (!newFriendName.trim()) {
      Alert.alert("Required", "Please enter a name.");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create Friend
      const response = await fetch(FRIENDS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friend_name: newFriendName,
          user_id: user?.id 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create friend: ${errorText}`);
      }
      const newFriend = await response.json();

      // 2. Link User to Friend (Relation)
      try {
        await fetch(USER_FRIENDS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user?.id,
            friend_id: newFriend.id,
            username: "testuser",
            friendname: newFriend.friend_name
          })
        });

      } catch (relError) {
        console.log("Relation creation skipped or failed (might be redundant):", relError);
      }
      
      // Refresh list and auto-select
      await loadFriends();
      setSelectedFriend(newFriend);
      setSelectedEvent(null);
      
      // Close modal
      setIsFriendModalVisible(false);
      setNewFriendName("");
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not create friend.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventName.trim()) {
      Alert.alert("Required", "Please enter an event name.");
      return;
    }
    if (!selectedFriend) {
      Alert.alert("Error", "No friend selected.");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create Event
      const response = await fetch(EVENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: newEventName,
          event_date: new Date().toISOString().split('T')[0],
          friend_id: selectedFriend.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${errorText}`);
      }
      const newEvent = await response.json();

      // 2. Link User to Event (Relation)
      const relationResponse = await fetch(USER_EVENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          event_id: newEvent.id
        })
      });
      console.log("User-Event relation response:", relationResponse);

      if (!relationResponse.ok) {
        console.warn("Failed to create user-event relation, but event was created.");
      }
      
      // Add to local state manually
      setEvents(prev => [newEvent, ...prev]);
      setSelectedEvent(newEvent);
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not create event.");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };


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
    let finalUserFriendEventId = null; 
    
    try {
      // 1. UPLOAD AUDIO
      const formData = new FormData();
      // @ts-ignore
      formData.append('audio', { uri: uri, type: 'audio/m4a', name: 'recording.m4a' });
      
      const friendName = selectedFriend.friend_name;
      // @ts-ignore
      const eventTitle = selectedEvent.title || selectedEvent.event_name || "Unknown Event";
      
      // --- FIX: Pass friend_name separately for the AI to use it in the prompt ---
      formData.append('friend_name', friendName); 
      // remarks can still be used for keyterms if needed
      formData.append('remarks', `Context: ${friendName} - ${eventTitle}`); 
      // --------------------------------------------------------------------------

      const response = await fetch(AUDIO_PROCESS_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Audio Processing Result:", result);

      // 2. CREATE FINAL USER-FRIENDS-EVENTS RELATION
      const finalRelationPayload = {
        user_id: user?.id,
        friend_id: selectedFriend.id,
        event_id: selectedEvent.id,
      };
      
      console.log("Attempting to create final User-Friend-Event link...");

      const finalRelationResponse = await fetch(USER_FRIENDS_EVENTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalRelationPayload)
      });
      
      if (!finalRelationResponse.ok) {
        console.warn("⚠️ Final Relation Link FAILED:", finalRelationResponse.status, await finalRelationResponse.text());
        Alert.alert("Warning", "Memory saved but failed to link all three IDs (check backend logs).");
      } else {
        const finalRelationData = await finalRelationResponse.json();
        finalUserFriendEventId = finalRelationData.id; 
        console.log("✅ Final User-Friend-Event Relation Linked! ID:", finalUserFriendEventId);
      }
      
      // 3. NAVIGATE TO REVIEW
      router.push({
        pathname: "/review" as any,
        params: { 
            data: JSON.stringify(result),
            userFriendEventId: finalUserFriendEventId ? String(finalUserFriendEventId) : '' 
        } 
      });

      Alert.alert("Success", "Memory analyzed and saved! Now review and confirm.");
      
    } catch (error) {
      console.error("Upload Failed:", error);
      Alert.alert("Upload Failed", "Could not connect to backend or process data.");
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
          Animated.timing(animValue, { toValue: 1, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration: duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
    };
    createBlobAnimation(blob1Anim, 4000).start();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.setValue(1);
    pulseAnim.stopAnimation();
  };

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

  // --- Render Helpers ---

  const renderCreateModal = (
    visible: boolean, 
    onClose: () => void, 
    title: string, 
    value: string, 
    setValue: (text: string) => void,
    onSubmit: () => void,
    placeholder: string
  ) => (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#A1887F" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.modalInput}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#D7CCC8"
            autoFocus
          />

          <TouchableOpacity 
            style={[styles.modalButton, isCreating && styles.modalButtonDisabled]}
            onPress={onSubmit}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.modalButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
  
  // UI IMPROVEMENT: Determine dynamic header title
  const headerTitleText = selectedFriend 
    ? `New Memory with ${selectedFriend.friend_name}` 
    : "New Memory";

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
        {/* UI IMPROVEMENT: Use dynamic header title */}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitleText}
        </Text>
        <View style={{ width: 48 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* --- Context Card --- */}
        <View style={styles.card}>
          
          {/* FRIEND SELECTOR */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>WHO IS THIS FOR?</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.selectorButton, { flex: 1 }]}
                onPress={() => {
                  setShowPersonDropdown(!showPersonDropdown);
                  setShowEventDropdown(false);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.iconCircle, { backgroundColor: "#FFECB3" }]}>
                  <User size={20} color="#8D6E63" />
                </View>
                <Text style={styles.selectorText} numberOfLines={1}>
                  {selectedFriend ? selectedFriend.friend_name : "Select Friend"}
                </Text>
                <ChevronDown size={20} color="#D7CCC8" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setIsFriendModalVisible(true)}
              >
                <Plus size={24} color="#4A4036" />
              </TouchableOpacity>
            </View>

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
                        setSelectedEvent(null); 
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

          {/* EVENT SELECTOR */}
          <View style={[styles.inputGroup, { zIndex: -1 }]}>
            <Text style={styles.label}>WHAT&apos;S HAPPENING?</Text>
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.selectorButton, { flex: 1 }]}
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
                <Text style={styles.selectorText} numberOfLines={1}>
                  {/* @ts-ignore */}
                  {selectedEvent ? (selectedEvent.title || selectedEvent.event_name) : "Select Event"}
                </Text>
                <ChevronDown size={20} color="#D7CCC8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.addButton, !selectedFriend && styles.addButtonDisabled]}
                disabled={!selectedFriend}
                onPress={() => setIsEventModalVisible(true)}
              >
                <Plus size={24} color={!selectedFriend ? "#D7CCC8" : "#4A4036"} />
              </TouchableOpacity>
            </View>

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
                      {/* @ts-ignore */}
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
        <TouchableOpacity 
          style={styles.saveButton} 
          activeOpacity={0.9}
          onPress={() => {
            if (recording) stopRecording();
            else Alert.alert("Record something first!");
          }}
        >
          <Text style={styles.saveButtonText}>Save Memory</Text>
        </TouchableOpacity>
      </View>

      {/* --- Modals --- */}
      {renderCreateModal(
        isFriendModalVisible,
        () => setIsFriendModalVisible(false),
        "New Friend",
        newFriendName,
        setNewFriendName,
        handleCreateFriend,
        "Enter friend's name"
      )}

      {renderCreateModal(
        isEventModalVisible,
        () => setIsEventModalVisible(false),
        "New Event",
        newEventName,
        setNewEventName,
        handleCreateEvent,
        "Enter event name (e.g. Lunch)"
      )}

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
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold', 
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
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold', 
    color: "#9C9480",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#FFFDF5",
    borderWidth: 2,
    borderColor: "#F0EAD6",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
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
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold', 
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
    // FONT CHANGE: Hardcoded 'Nunito-SemiBold' (was 600)
    fontFamily: 'Nunito-SemiBold', 
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
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold', 
    color: "#A1887F",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 80,
    // FONT CHANGE: Hardcoded 'Nunito-ExtraBold' (was 900)
    fontFamily: 'Nunito-ExtraBold', 
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
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was bold)
    fontFamily: 'Nunito-Bold', 
    letterSpacing: 0.5,
  },
  
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    // FONT CHANGE: Hardcoded 'Nunito-ExtraBold' (was 800)
    fontFamily: 'Nunito-ExtraBold', 
    color: "#4A4036",
  },
  modalInput: {
    backgroundColor: "#FFFDF5",
    borderWidth: 2,
    borderColor: "#F0EAD6",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    // FONT CHANGE: Hardcoded 'Nunito-Regular' (was 400)
    fontFamily: 'Nunito-Regular', 
    color: "#4A4036",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#4A4036",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonText: {
    color: "#FFF8E1",
    fontSize: 16,
    // FONT CHANGE: Hardcoded 'Nunito-Bold' (was 700)
    fontFamily: 'Nunito-Bold', 
  },
});