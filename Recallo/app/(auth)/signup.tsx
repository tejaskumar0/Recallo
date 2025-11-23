import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

// Define the palette outside the component for clean access
const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff", // Used for input background/card
  textPrimary: "#2b2100", // Dark brown for primary text
  textSecondary: "#4f4a2e", // Lighter brown for secondary text/labels
  accent: "#fef08a", // Bright yellow (unused here, but defined)
  border: "rgba(0, 0, 0, 0.05)",
  buttonPrimary: "#2b2100", // Dark brown for button background
  buttonText: "#f2efe0ff", // Light cream for button text
};

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth() as any;
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(email, password, { full_name: name });
    
    if (error) {
      setLoading(false);
      Alert.alert("Signup Error", error?.message || "An error occurred during signup");
      return;
    }

    setLoading(false);
    Alert.alert(
      "Verification Email Sent",
      "Please check your email to verify your account before logging in.",
      [{ text: "OK", onPress: () => router.replace(`/verify-email?email=${encodeURIComponent(email)}`) }]
    );
  };

  // Helper component for the Eye icon, wrapped in a Pressable
  const EyeToggle = ({ visible, onPress, disabled }: { visible: boolean, onPress: () => void, disabled: boolean }) => (
    <Pressable
      style={styles.eyeIcon}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name={visible ? "eye" : "eye-off"}
        size={24} // Slightly larger icon
        color={palette.textSecondary + '80'}
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Recallo to start capturing your conversations
            </Text>
          </View>

          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={palette.textSecondary + '80'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={palette.textSecondary + '80'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, styles.passwordContainer]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor={palette.textSecondary + '80'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  editable={!loading}
                />
                <EyeToggle
                    visible={showPassword}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={loading}
                />
              </View>
              <Text style={styles.hint}>Minimum 6 characters</Text>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, styles.passwordContainer]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor={palette.textSecondary + '80'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  editable={!loading}
                />
                <EyeToggle
                    visible={showConfirmPassword}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                />
              </View>
            </View>
          </View>
          
          {/* Terms and Button */}
          <View style={styles.bottomSection}>
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSignup}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.buttonText} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Link href={"/login" as any} asChild>
                <TouchableOpacity activeOpacity={0.7} disabled={loading}>
                  <Text style={styles.linkText}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30, // Increased padding to match LoginScreen
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 50, // Increased margin for spacing
  },
  title: {
    fontSize: 40, // Match LoginScreen title size
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
    color: palette.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  formContainer: {
    flexShrink: 0, // Ensure it doesn't take up full vertical space unnecessarily
  },
  bottomSection: {
    marginTop: 20,
    flexShrink: 0,
  },
  inputGroup: {
    marginBottom: 25, // Increased spacing between input groups
  },
  label: {
    fontSize: 16, // Match LoginScreen label size
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textPrimary,
    marginBottom: 8,
    marginLeft: 10,
  },
  inputWrapper: {
    backgroundColor: palette.card, // Card color for input background
    borderRadius: 20, // More rounded corners
    shadowColor: palette.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, 
    shadowRadius: 2,
    elevation: 1,
    paddingHorizontal: 10, // Padding for better text alignment inside the wrapper
    height: 58,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 18,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textPrimary,
    paddingHorizontal: 10,
  },
  passwordContainer: {
    position: "relative",
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 18,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textPrimary,
    paddingHorizontal: 10,
    height: 58,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  hint: {
    fontSize: 14, // Slightly larger hint text
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    marginTop: 6,
    marginLeft: 10,
  },
  termsContainer: {
    marginBottom: 30,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },
  termsLink: {
    color: palette.textPrimary,
    fontFamily: 'Nunito-Bold', // Applied specific font family
  },
  primaryButton: {
    backgroundColor: palette.buttonPrimary, // Dark brown primary button
    borderRadius: 30, // Fully rounded
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 40,
    // Stronger shadow for the main CTA
    shadowColor: palette.buttonPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
    color: palette.buttonText, // Light cream text
  },
  // Removed divider styles as they are not used in the final button section
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textPrimary,
  },
});