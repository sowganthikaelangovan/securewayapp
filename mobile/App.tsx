import { registerRootComponent } from "expo";
import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSecureway, bootstrapSecureway } from "@/lib/secureway-store";

import { HomeScreen } from "./screens/HomeScreen";
import { LocationScreen } from "./screens/LocationScreen";
import { ContactsScreen } from "./screens/ContactsScreen";
import { RoutesScreen } from "./screens/RoutesScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginScreen } from "./screens/LoginScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const { user } = useSecureway();

  useEffect(() => {
    bootstrapSecureway();
  }, []);

  if (!user) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#090d16" />
        <LoginScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#0d1322" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0d1322",
            borderTopColor: "#1e293b",
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#0284c7",
          tabBarInactiveTintColor: "#64748b",
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: "SOS",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="shield" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Location"
          component={LocationScreen}
          options={{
            tabBarLabel: "Location",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="location" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Contacts"
          component={ContactsScreen}
          options={{
            tabBarLabel: "Contacts",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Routes"
          component={RoutesScreen}
          options={{
            tabBarLabel: "Routes",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="navigate" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);

