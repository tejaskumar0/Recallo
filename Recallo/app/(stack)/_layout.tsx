import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>

      {/* Set 'home' as the first screen in this stack */}
      <Stack.Screen name="home" /> 
      
      {/* The main screens moved from (tabs) */}
      <Stack.Screen name="events" />
      <Stack.Screen name="people" />
      
      {/* Existing screens */}
      <Stack.Screen name="capture" />
      
      {/* NEW SCREEN - This registers the route! */}
      <Stack.Screen 
        name="review" 
        options={{ 
          presentation: 'card', // or 'modal' 
          animation: 'slide_from_right'
        }} 
      />
    </Stack>
  );
}