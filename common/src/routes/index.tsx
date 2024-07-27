import { NavigationContainer } from '@react-navigation/native'
import { AppRoutes } from './app.routes'
import React from 'react'

export function Routes() {
    return (
        <NavigationContainer>
            <AppRoutes />
        </NavigationContainer>
    )
}
