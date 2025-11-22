// app/index.tsx
import { useEffect } from "react";
import { useRouter } from "expo-router";

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Add a small delay to ensure navigation happens after mount
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return null;
}