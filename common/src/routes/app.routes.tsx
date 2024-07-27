import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { NodeSelectionScreen } from "../screens/NodeSelection"
import { LoginScreen } from "../screens/Login"
import { HomeRoutes } from "./home.routes"
import React from "react"

const { Navigator, Screen } = createNativeStackNavigator()

export function AppRoutes() {
    return (
        <Navigator
            screenOptions={{
                headerBackVisible: false,
                navigationBarHidden: true,
                headerShown: false,
            }}
            initialRouteName="NodeSelection"
        >
            <Screen
                name="NodeSelection"
                component={NodeSelectionScreen}
            />
            <Screen name="Login" component={LoginScreen} />
            <Screen name="Nostrlivery" component={HomeRoutes} />
        </Navigator>
    )
}