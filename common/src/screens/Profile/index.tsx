import { useEffect, useState } from "react"
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native"
import Toast from "react-native-toast-message"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import {StorageService, StoredKey} from "../../service/StorageService";
import {NodeService} from "../../service/NodeService";
import {NostrService} from "../../service/NostrService";
import React from "react";
import {ActionButton} from "../../components/ActionButton";
import {SelectInput} from "../../components/SelectInput";



export const ProfileScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>({})
    const [nodeUrl, setNodeUrl] = useState<string>("")
    const [paymentRate, setPaymentRate] = useState<string>("")
    const [disabledNodeUrlBtn, setDisabledNodeUrlBtn] = useState<boolean>(true)
    const storageService = new StorageService()
    const nodeService = new NodeService()
    const nostrService = new NostrService()

    useEffect(() => {
        storageService.get(StoredKey.NODE_URL).then((data) => {
            if (!data) {
                navigation.navigate("NodeSelectionScreen")
            }
            setNodeUrl(data)
        })

        storageService.get(StoredKey.PROFILE).then((data) => {
            if (!data) {
                navigation.navigate("Login")
            }
            setProfile(data)
            setPaymentRate(data.paymentRate)
        })
    }, [])

    useEffect(() => {
        storageService.get(StoredKey.NODE_URL).then((data) => {
            if (nodeUrl !== data && nodeUrl !== "") {
                setDisabledNodeUrlBtn(false)
            } else {
                setDisabledNodeUrlBtn(true)
            }
        })
    }, [nodeUrl])

    function navigateToHome() {
        navigation.navigate("Home")
    }

    function handleSaveNodeUrl() {
        const nodeService = new NodeService()

        nodeService
            .getNodeIdentity(nodeUrl)
            .then((_) => {
                setDisabledNodeUrlBtn(true)
                Toast.show({
                    type: "success",
                    text1: "Node url saved",
                })
            })
            .catch((e) => {
                Toast.show({
                    type: "error",
                    text1: e,
                })
            })
    }

    function handleUpdateCurrency(currency: string) {
        const profileWithCurrency = {...profile, currency: currency}

        storageService.get(StoredKey.NSEC).then(async nsec => {
            const profileUpdateEvent = nostrService.signNostrEvent(nsec, 0, [], profileWithCurrency)
            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: profileUpdateEvent})

            try {
                await nodeService.postEvent(event)
                await storageService.set(StoredKey.PROFILE, profileWithCurrency)
                Toast.show({
                    type: "success",
                    text1: "Currency updated",
                })
            } catch (e) {
                console.log(e)
            }
        }).catch((e) => {
            Toast.show({
                type: "error",
                text1: e,
            })
        })
    }

    function handleUpdatePaymentRate() {
        const profileWithPaymentRate = {...profile, payment_rate: paymentRate}

        storageService.get(StoredKey.NSEC).then(async nsec => {
            const profileUpdateEvent = nostrService.signNostrEvent(nsec, 0, [], profileWithPaymentRate)
            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: profileUpdateEvent})

            try {
                await nodeService.postEvent(event)
                await storageService.set(StoredKey.PROFILE, profileWithPaymentRate)
                Toast.show({
                    type: "success",
                    text1: "Payment rate updated",
                })
            } catch (e) {
                Toast.show({
                    type: "error",
                    text1: e as any,
                })
            }
        })
    }

    function handleLogout() {
        storageService.remove(StoredKey.PROFILE).then()
        storageService.remove(StoredKey.NSEC).then()
        navigation.navigate("Login")
    }

    function handlePaymentInputChange(value: string) {
        value = Number(value.replace(/[^\d]/g, "").padStart(3, "0").replace(/(\d+)(\d{2})$/g, '$1.$2')).toFixed(2)

        setPaymentRate(value)
    }

    return (
        <View style={styles.profileContainer}>
            <TouchableOpacity style={styles.closeBtn} onPress={navigateToHome}>
                <MaterialCommunityIcons name="close" color={"#000"} size={35} />
            </TouchableOpacity>
            <View style={styles.basicInfoContainer}>
                <View style={styles.nameInfo}>
                    <Text style={{ fontWeight: "500", fontSize: 30 }}>
                        {profile.display_name}
                    </Text>
                    <Text style={{ fontSize: 15, marginBottom: 10 }}>
                        @{profile.name}
                    </Text>
                </View>
                <View style={styles.profilePicContainer}>
                    <View style={{ width: 80, height: 80 }}>
                        <Image
                            style={{
                                borderRadius: 40,
                                width: 80,
                                height: 80,
                                padding: 0,
                            }}
                            source={{
                                uri: profile.picture,
                            }}
                            alt="profile_picture"
                        />
                    </View>
                </View>
            </View>
            <View>
                <Text style={{ fontSize: 16 }}>Node Url</Text>
                <TextInput
                    style={styles.input}
                    value={nodeUrl}
                    onChangeText={setNodeUrl}
                />
                <ActionButton
                    disabled={disabledNodeUrlBtn}
                    title={"Save"}
                    color={"purple"}
                    onPress={handleSaveNodeUrl}
                />
            </View>
            <View>
                <Text style={{ fontSize: 16 }}>Currency</Text>
                <SelectInput
                    data={[
                        {label: 'R$', value: 'BRL'},
                        {label: '$', value: 'USD'},
                        {label: 'BTC', value: 'BTC'},
                        {label: '€', value: 'EUR'}
                    ]}
                    emptyMessage={"Select your currency"}
                    callback={handleUpdateCurrency}
                />
            </View>
            <View>
                <Text style={{ fontSize: 16 }}>Payment Rate (per km)</Text>
                <TextInput
                    style={styles.input}
                    value={paymentRate}
                    onChangeText={handlePaymentInputChange}
                    keyboardType="numeric"
                />
                <ActionButton
                    disabled={false}
                    title={"Save"}
                    color={"purple"}
                    onPress={handleUpdatePaymentRate}
                />
            </View>
            <View>
                <Text style={{ fontSize: 16 }}>Session</Text>
                <ActionButton title={"Logout"} color={"red"} onPress={handleLogout} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    profileContainer: {
        display: "flex",
        flexDirection: "column",
        padding: 20,
        paddingTop: 25,
        gap: 15,
    },
    basicInfoContainer: {
        display: "flex",
        flexDirection: "row",
        marginTop: 10,
        gap: 10,
    },
    nameInfo: {
        display: "flex",
        flexGrow: 3,
        justifyContent: "center",
    },
    profilePicContainer: {
        display: "flex",
        alignItems: "flex-end",
        alignContent: "flex-end",
        paddingTop: 8,
    },
    closeBtn: {
        position: "absolute",
        top: 2,
        right: 10,
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
