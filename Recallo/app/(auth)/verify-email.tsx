import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user } = useAuth() as { user: { email?: string } | null };
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const checkEmailVerification = async () => {
    setChecking(true);
    
    // Refresh session to check if email is verified
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      Alert.alert("Error", "Failed to check verification status");
      setChecking(false);
      return;
    }

    if (session?.user?.email_confirmed_at) {
      Alert.alert("Success", "Email verified successfully!", [
        {
          text: "Continue",
          // Cast to any to avoid TS errors until routes regenerate
          onPress: () => router.replace("/home" as any),
        },
      ]);
    } else {
      Alert.alert("Not Verified", "Please check your email and click the verification link");
    }
    
    setChecking(false);
  };

  const resendVerificationEmail = async () => {
    if (countdown > 0) return;

    setResending(true);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user?.email || '',
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail" size={48} color={palette.textPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Verify your email</Text>
        
        <Text style={styles.subtitle}>
          We&apos;ve sent a verification link to:
        </Text>
        
        <Text style={styles.email}>{user?.email}</Text>

        <Text style={styles.description}>
          Please check your inbox and click the verification link to activate your account.
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={palette.textSecondary} />
          <Text style={styles.infoText}>
            Didn&apos;t receive the email? Check your spam folder or request a new verification email.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, checking && styles.disabledButton]}
          onPress={checkEmailVerification}
          activeOpacity={0.85}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={palette.textPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={palette.textPrimary} />
              <Text style={styles.primaryButtonText}>I&apos;ve verified my email</Text>
            </>
          )}
        </TouchableOpacity>

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

        <View style={styles.footer}>
          <TouchableOpacity
            // Cast to any to avoid TS errors until routes regenerate
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

const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff",
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
  accent: "#fef08a",
  border: "rgba(0, 0, 0, 0.05)",
  inputBg: "rgba(255, 255, 255, 0.5)",
  infoCard: "rgba(254, 240, 138, 0.2)",
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: palette.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    marginBottom: 8,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: palette.infoCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: palette.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: palette.card,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 16,
    gap: 8,
    minWidth: "80%",
    justifyContent: "center",
    ...shadow,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  secondaryButton: {
    flexDirection: "row",
    backgroundColor: palette.inputBg,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 32,
    gap: 8,
    minWidth: "80%",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textSecondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 40,
  },
  footerLink: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: "600",
  },
});