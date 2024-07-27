import React from "react"
import {StyleSheet, Text, TextInput, View} from "react-native"
import Toast from "react-native-toast-message"
import {getPublicKey, nip19} from "nostr-tools"
import {NodeService} from "../../service/NodeService";
import {StorageService, StoredKey} from "../../service/StorageService";
import {ActionButton} from "../../components/ActionButton";
import {ValidationUtils} from "../../util/validationUtils";

export const LoginScreen = ({ navigation }: any) => {
    const [nsecInput, onChangeNsecInput] = React.useState("")
    const nodeService = new NodeService()
    const storageService = new StorageService()

    const authenticate = async () => {
        await storageService.set(StoredKey.NSEC, nsecInput)

        const profile = await nodeService.queryEvent({kinds:[0], authors: [getPublicKey(nip19.decode(nsecInput).data as Uint8Array)]})

        if(!ValidationUtils.isEmpty(profile)){
            await storageService.set(StoredKey.PROFILE, profile)
            navigation.navigate("Nostrlivery")
        } else {
            await storageService.remove(StoredKey.NSEC)
            Toast.show({
                type: "error",
                text1: "Failed to login",
            })
        }
    }

    storageService.areValuesPresent(StoredKey.NODE_NPUB).then((isPresent) => {
        if (!isPresent) {
            navigation.navigate("NodeSelectionScreen")
        }
    })

    storageService.areValuesPresent(StoredKey.PROFILE).then((isPresent) => {
        if (isPresent) {
            navigation.navigate("Nostrlivery")
        }
    }).catch(e => { console.log(e) })

    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: "2%" }}>
                Login
            </Text>
            <Text style={styles.label}>Enter your nsec</Text>
            <TextInput style={styles.input} onChangeText={onChangeNsecInput} secureTextEntry={true} />
            <ActionButton title={"Enter"} color={"purple"} onPress={authenticate} />
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
