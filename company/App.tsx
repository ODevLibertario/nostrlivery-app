import "text-encoding"
import "react-native-get-random-values"
import React, { useEffect } from "react"
import Toast from "react-native-toast-message"
import * as Font from "expo-font"
import { Routes } from "./src/routes"

export default function App() {
    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                'MaterialCommunityIcons': require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
                'FontAwesome': require('react-native-vector-icons/Fonts/FontAwesome.ttf'),
            })
        }
        loadFonts()
    }, [])

    return (
        <>
            <Routes />
            <Toast position="bottom" />
        </>
    )
}