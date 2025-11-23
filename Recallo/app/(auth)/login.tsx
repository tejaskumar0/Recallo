import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  SafeAreaView, 
} from "react-native";
import { useRouter, Link } from "expo-router";
// NOTE: Assuming useAuth is correctly imported from your context file
import { useAuth } from "../../contexts/AuthContext"; 

// Define the palette outside the component for clean access
const palette = {
  background: "#f2efe0ff",
  card: "#f3f3d0ff", 
  textPrimary: "#2b2100", 
  textSecondary: "#4f4a2e", 
  accent: "#fef08a", 
  border: "rgba(0, 0, 0, 0.05)",
  buttonPrimary: "#2b2100", 
  buttonText: "#f2efe0ff", 
};

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
        // Use real signIn function provided by AuthContext
        const { data, error } = await signIn(email, password); 
        
        if (error) {
            // Check for a specific error message structure if needed
            throw new Error(error.message || error);
        }

        setLoading(false);
        router.replace("/home");
    } catch (error: any) {
        setLoading(false);
        Alert.alert("Login Error", error.message || "An unexpected error occurred during login.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome!</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                placeholder="Enter your email"
                placeholderTextColor={palette.textSecondary + '80'} 
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                value={password}
                placeholder="********"
                placeholderTextColor={palette.textSecondary + '80'}
                secureTextEntry={true}
                autoCapitalize="none"
                textContentType="password"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={palette.buttonText} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.forgotPasswordContainer}>
             <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Navigate to password reset screen.")}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
             </TouchableOpacity>
          </View>


          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background, 
  },
  container: {
    flex: 1,
    backgroundColor: palette.background, 
    paddingHorizontal: 30, 
    justifyContent: "center",
  },
  title: {
    fontSize: 40, 
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
    color: palette.textPrimary,
    marginBottom: 60,
    textAlign: "center",
    letterSpacing: -1,
  },
  form: {
    gap: 25, 
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold', // Applied specific font family
    color: palette.textSecondary, 
    marginLeft: 10,
  },
  inputWrapper: {
    backgroundColor: palette.card, 
    borderRadius: 20, 
    shadowColor: palette.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, 
    shadowRadius: 2,
    elevation: 1,
    paddingHorizontal: 10, 
  },
  input: {
    backgroundColor: 'transparent', 
    height: 58, 
    fontSize: 18,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    color: palette.textPrimary,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: palette.buttonPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    shadowColor: palette.buttonPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: palette.buttonText,
    fontSize: 20,
    fontFamily: 'Nunito-ExtraBold', // Applied specific font family
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -10,
    marginRight: 10,
  },
  forgotPasswordText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontFamily: 'Nunito-Regular', // Applied specific font family
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: palette.textSecondary,
    fontSize: 16,
    fontFamily: 'Nunito-Regular', // Applied specific font family
  },
  link: {
    color: palette.textPrimary, 
    fontFamily: 'Nunito-Bold', // Applied specific font family
    fontSize: 16,
  },
});