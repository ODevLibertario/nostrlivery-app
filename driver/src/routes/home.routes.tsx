import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import FontAwesome from "react-native-vector-icons/FontAwesome"

import { HomeScreen } from "../screens/Home"
import { MenuScreen } from "../screens/Menu"
import { ProfileScreen } from "../screens/Profile"
import { MenuItem } from "../screens/MenuItem"

const { Navigator, Screen } = createBottomTabNavigator()

export function HomeRoutes() {
    return (
        <Navigator
            initialRouteName="Home"
            screenOptions={{
                tabBarStyle: {
                    height: 80,
                    paddingBottom: 20,
                },
                tabBarActiveTintColor: "#2f1650",
                tabBarInactiveTintColor: "#a8a8a8",
                tabBarLabelStyle: {
                    fontSize: 14,
                },
            }}
        >
            <Screen
                name="Home"
                component={HomeScreen}
                options={{

                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Screen
                name="Drivers"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="motorcycle" color={color} size={size} />
                    ),
                }}
            />
            <Screen
                name="Orders"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cart" color={color} size={size} />
                    ),
                }}
            />
            <Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" color={color} size={size} />
                    ),
                }}
            />
            <Screen name="Menu" component={MenuScreen} options={{
                tabBarButton: () => null
            }} />
            <Screen name="Menu Item" component={MenuItem} options={{
                tabBarButton: () => null
            }} />
        </Navigator>
    )
}