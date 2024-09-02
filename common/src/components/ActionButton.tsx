import React from "react"
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native"

interface Props {
    onPress: () => void
    title: string
    color: string
    disabled?: boolean
    isLoading?: boolean
    customStyle?: any
}

export const ActionButton = ({
    onPress,
    title,
    color,
    disabled = false,
    customStyle = {},
    isLoading = false,
}: Props) => {
    return (
        <TouchableOpacity
            disabled={disabled}
            style={{
                ...customStyle,
                ...styles.button,
                backgroundColor: disabled ? "#c8c8c8" : color,
            }}
            onPress={onPress}
        >
            {isLoading ? (
                <ActivityIndicator animating={isLoading} color="white" />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
})
