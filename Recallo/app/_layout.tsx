import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { useFonts } from 'expo-font'; 
import { supabase } from "../lib/supabase";
import { AuthProvider } from "../contexts/AuthContext";

// Keep the splash screen visible until the font assets are ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  
  // 1. Load the specific Nunito Fonts based on available files
  const [loaded, error] = useFonts({ 
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-SemiBold': require('../assets/fonts/Nunito-SemiBold.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
  });

  // 2. Handle Supabase Session and Font Loading
  useEffect(() => {
    // Supabase Listener setup
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Hide splash screen after assets (fonts) are loaded
    if (loaded) {
      SplashScreen.hideAsync();
    }
    
    return () => subscription.unsubscribe();
  }, [loaded]);

  // Exit early if fonts are not loaded yet
  if (!loaded) {
    return null;
  }
  
  if (error) {
    // Log the error to see which file failed to load
    console.error("Font loading error:", error);
  }

  // 3. Conditional Stack Rendering
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" /> 
        
        {/* Conditional rendering based on session */}
        {session && session.user ? (
          // User is authenticated: Show the main app tabs
          <Stack.Screen name="(stack)" />
        ) : (
          // User is NOT authenticated: Show the authentication flow (login/signup)
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </AuthProvider>
  );
}