export default {
    expo: {
      name: "Recallo",
      slug: "Recallo",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.yourcompany.recallo"
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        package: "com.yourcompany.recallo"
      },
      web: {
        favicon: "./assets/favicon.png"
      },
      extra: {
        apiUrl: process.env.API_URL || "http://172.23.57.4:8000/api/v1",
        supabaseUrl: process.env.SUPABASE_URL || "https://jyyzccmpngjuiphyahoz.supabase.co",
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5eXpjY21wbmdqdWlwaHlhaG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODA3OTEsImV4cCI6MjA3OTM1Njc5MX0.4VvfHkGXIlr6OeAZWlJO3_IncFGKU-nW4wZQxEpcHpg"
      }
    }
  };