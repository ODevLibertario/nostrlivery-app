import React, { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { NodeService } from "../../service/NodeService"
import { StorageService, StoredKey } from "../../service/StorageService"
import { SelectInput } from "../../components/SelectInput"
import { ActionButton } from "../../components/ActionButton"
import { nodeConfig } from "../../config/app.config"

export const NodeSelectionScreen = ({ navigation }: any) => {
    const [nodeUrl, onChangeNodeUrl] = useState(nodeConfig.url)
    const [isFetchingIdentity, setIsFetchingIdentity] = useState(false)

    const nodeService = new NodeService()
    const storageService = new StorageService()

    const selectNode = () => {
        if (!nodeUrl || nodeUrl.trim() === "") {
            Toast.show({
                type: "error",
                text1: "Please select a node server",
            })
            return
        }

        setIsFetchingIdentity(true)
        nodeService
            .getNodeIdentity(nodeUrl)
            .then(() => navigation.navigate("Login"))
            .catch((e) => {
                Toast.show({
                    type: "error",
                    text1: e.message || "Failed to connect to node server",
                })
            })
            .finally(() => {
                setIsFetchingIdentity(false)
            })
    }

    storageService
        .areValuesPresent(StoredKey.NODE_NPUB, StoredKey.NODE_URL)
        .then((result) => {
            if (result) {
                navigation.navigate("Login")
            }
        })
        .catch((e) => e)

    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: "bold", fontSize: 20, marginBottom: "2%" }}>
                Node Selection
            </Text>
            <SelectInput
                data={[{ label: `Node Server (${nodeConfig.url})`, value: nodeConfig.url }]}
                emptyMessage={"Select your node"}
                callback={onChangeNodeUrl}
            ></SelectInput>
            <ActionButton
                title={"Enter"}
                color={"purple"}
                onPress={selectNode}
                isLoading={isFetchingIdentity}
                disabled={isFetchingIdentity}
                customStyle={{ marginTop: "5%" }}
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
