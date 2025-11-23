import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

// Define the palette outside the component for clean access
const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff", // Used for the icon circle and check button background
  textPrimary: "#2b2100", // Dark brown for primary text & button background
  textSecondary: "#4f4a2e", // Lighter brown for secondary text/labels
  accent: "#fef08a", // Bright yellow
  border: "rgba(0, 0, 0, 0.05)",
  buttonPrimary: "#2b2100", // Dark brown for primary button background
  buttonText: "#f2efe0ff", // Light cream for primary button text
  infoCard: "rgba(254, 240, 138, 0.25)", // Light yellow background for info
};

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user } = useAuth() as { user: { email?: string } | null };
  
  const { email: paramEmail } = useLocalSearchParams<{ email: string }>();
  
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Determine which email to display, prioritizing the query parameter
  const displayEmail = paramEmail || user?.email;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkEmailVerification = async () => {
    setChecking(true);
    
    // Refresh session to check if email is verified
    // NOTE: This typically involves retrieving the current session from persistent storage
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      Alert.alert("Error", "Failed to check verification status");
      setChecking(false);
      return;
    }

    // Supabase sets email_confirmed_at when the link is clicked
    if (session?.user?.email_confirmed_at) {
      Alert.alert("Success", "Email verified successfully!", [
        {
          text: "Continue",
          onPress: () => router.replace("/home" as any),
        },
      ]);
    } else {
      Alert.alert("Not Verified", "Please check your email and click the verification link");
    }
    
    setChecking(false);
  };

  const resendVerificationEmail = async () => {
    if (countdown > 0 || !displayEmail) return;

    setResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: displayEmail,
    });
    
    setResending(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Email Sent", "Verification email has been sent");
      setCountdown(60); // Start 60 second countdown
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        
        {/* Mail Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail" size={48} color={palette.textPrimary} />
          </View>
        </View>

        {/* Header Text */}
        <Text style={styles.title}>Verify your email</Text>
        
        <Text style={styles.subtitle}>
          We&apos;ve sent a verification link to:
        </Text>
        
        <Text style={styles.email}>{displayEmail}</Text>

        <Text style={styles.description}>
          Please check your inbox (and spam folder) and click the verification link to activate your account.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={palette.textSecondary} />
          <Text style={styles.infoText}>
            Didn&apos;t receive the email? Check your spam folder or use the &apos;Resend&apos; button below.
          </Text>
        </View>

        {/* Primary Button: Check Verification Status */}
        <TouchableOpacity
          style={[styles.primaryButton, checking && styles.disabledButton]}
          onPress={checkEmailVerification}
          activeOpacity={0.85}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={palette.buttonText} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={palette.buttonText} />
              <Text style={styles.primaryButtonText}>I&apos;ve verified my email</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Button: Resend Email */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            (resending || countdown > 0) && styles.disabledButton,
          ]}
          onPress={resendVerificationEmail}
          activeOpacity={0.85}
          disabled={resending || countdown > 0}
        >
          {resending ? (
            <ActivityIndicator color={palette.textSecondary} />
          ) : (
            <>
              <Ionicons name="refresh" size={20} color={palette.textSecondary} />
              <Text style={styles.secondaryButtonText}>
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend verification email"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Footer Link */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.replace("/login" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.footerLink}>Back to login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30, // Consistent padding
    paddingTop: 60,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 40, // Increased spacing
  },
  iconCircle: {
    width: 120, // Slightly larger icon circle
    height: 120,
    borderRadius: 60,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
    color: palette.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18, // Larger subtitle
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    fontSize: 20, // Highlighted email
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textPrimary,
    marginBottom: 32,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 5,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: palette.infoCard,
    borderRadius: 20, // Consistent rounded corners
    padding: 20, // Increased padding
    marginBottom: 40, // Increased spacing
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
    alignSelf: 'stretch', // Fill the width
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: palette.buttonPrimary, // Dark primary color for high contrast
    borderRadius: 30, // Consistent button style
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
    width: "100%", // Full width
    justifyContent: "center",
    // Stronger shadow for the main CTA
    shadowColor: palette.buttonPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
    color: palette.buttonText, // Light cream text
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: palette.card, // Light card color for secondary action
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 32,
    gap: 10,
    width: "100%", // Full width
    justifyContent: "center",
    ...shadow,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textSecondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
  footerLink: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textSecondary,
    textDecorationLine: 'underline',
  },
});