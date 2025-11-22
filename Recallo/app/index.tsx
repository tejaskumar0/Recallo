import { Redirect } from "expo-router";

export default function IndexScreen() {
  // Automatically redirects to the login page immediately
  return <Redirect href="/login" />;
}