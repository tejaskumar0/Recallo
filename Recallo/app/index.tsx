import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Image, useWindowDimensions } from "react-native";
import { colors } from "../constants/theme";

export default function Welcome() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const gifSize = height * 0.8;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
      <View style={{ marginLeft: width * 0.1 }}>
        <Image
          source={require("../assets/images/logo gif.gif")}
          style={{ width: gifSize, height: gifSize }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}