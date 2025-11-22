import { Tabs } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";

// Matches your design palette
const palette = {
  textPrimary: "#2b2100",
  textSecondary: "#4f4a2e",
};

const shadow = {
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 5,
};

/**
 * A custom Tab Bar component that replicates your "BottomNav" floating pill design.
 */
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <SafeAreaView style={styles.bottomNavSafeArea}>
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            
            // Determine the label (use options.title or fallback to route name)
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.85}
                style={[
                  styles.bottomNavItem,
                  isFocused && styles.bottomNavItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.bottomNavLabel,
                    isFocused && styles.bottomNavLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Matches your app background color
        sceneStyle: { backgroundColor: "#f2efe0ff" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: "People",
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bottomNavSafeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Pointer events box-none ensures touches pass through the empty areas
    // so you can scroll content behind the floating bar if needed (though usually padding handles this)
  },
  bottomNavWrapper: {
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 0 : 20,
    marginBottom: 12, // Lift it up slightly
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#cdc4a1ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...shadow,
  },
  bottomNavItem: {
    paddingHorizontal: 20, // Slightly wider touch target
    paddingVertical: 10,
    borderRadius: 999,
  },
  bottomNavItemActive: {
    backgroundColor: "#ffffff",
  },
  bottomNavLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
    fontSize: 14,
    textTransform: "capitalize",
  },
  bottomNavLabelActive: {
    color: palette.textPrimary,
    fontWeight: "800",
  },
});