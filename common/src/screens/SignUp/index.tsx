import React from "react"
import { StyleSheet, Text, TextInput, View } from "react-native"
import Toast from "react-native-toast-message"
import { nip19, generateSecretKey } from "nostr-tools"
import { NodeService } from "../../service/NodeService"
import { ActionButton } from "../../components/ActionButton"
import { NostrService } from "../../service/NostrService"
import * as Clipboard from "expo-clipboard"

export const SignUpScreen = ({ navigation }: any) => {
    const [usernameInput, onChangeUsernameInput] = React.useState("")
    const [isSigningUp, setIsSigningUp] = React.useState(false)
    const nodeService = new NodeService()
    const nostrService = new NostrService()

    const signUp = async () => {
        setIsSigningUp(true)

        try {
            const nsec = nip19.nsecEncode(generateSecretKey()) // `sk` is a Uint8Array

            const profileUpdateEvent = nostrService.signNostrEvent(nsec, 0, [], {
                name: usernameInput,
                about: "",
                picture: "",
                website: "",
                nip05: "",
                lud16: "",
            })

            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {
                event: profileUpdateEvent,
            })

            await nodeService.postEvent(event)
            await Clipboard.setStringAsync(nsec)
            Toast.show({
                type: "success",
                text1: "Nsec copied to clipboard",
            })
            navigation.navigate("Login")
        } catch (e) {
            console.log(e)
            Toast.show({
                type: "error",
                text1: "Failed to Sign up",
            })
        } finally {
            setIsSigningUp(false)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: "2%" }}>
                Sign Up
            </Text>
            <Text style={styles.label}>Enter your username</Text>
            <TextInput
                autoCapitalize="none"
                style={styles.input}
                onChangeText={onChangeUsernameInput}
            />
            <ActionButton
                title={"Sign Up"}
                color={"purple"}
                isLoading={isSigningUp}
                disabled={isSigningUp}
                onPress={signUp}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        margin: "2%",
        marginTop: "25%",
    },
    label: {
        marginBottom: 8,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: "2%",
    },
})
