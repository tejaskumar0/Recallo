import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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