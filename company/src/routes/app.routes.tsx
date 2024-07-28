import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { HomeRoutes } from "./home.routes"
import React from "react"
import {SignUpScreen, NodeSelectionScreen, LoginScreen} from "@odevlibertario/nostrlivery-common"

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
            <Screen name="SignUp" component={SignUpScreen} />
            <Screen name="Nostrlivery" component={HomeRoutes} />
        </Navigator>
    )
}