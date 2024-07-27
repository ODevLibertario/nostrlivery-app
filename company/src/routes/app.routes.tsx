import { createNativeStackNavigator } from "@react-navigation/native-stack"

import { NodeSelectionScreen, LoginScreen } from "nostrlivery-common"
import { HomeRoutes } from "./home.routes"

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