// app/login.tsx
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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setLoading(false);
      router.replace("/home");
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue capturing your conversations
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={palette.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={22}
                    color={palette.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <Link href="/signup" asChild>
                <TouchableOpacity activeOpacity={0.7} disabled={loading}>
                  <Text style={styles.linkText}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    backgroundColor: palette.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 50,
    fontSize: 15,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.border,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -11 }],
  },
  primaryButton: {
    backgroundColor: palette.card,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
    marginTop: 24,
    ...shadow,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: palette.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: palette.textPrimary,
    fontWeight: "700",
  },
});