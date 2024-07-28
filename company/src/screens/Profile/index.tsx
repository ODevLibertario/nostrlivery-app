import { useEffect, useState } from "react"
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native"
import Toast from "react-native-toast-message"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import {GeolocationUtils, ValidationUtils, StorageService, NodeService, NostrService, StoredKey, ActionButton, SelectInput} from "@odevlibertario/nostrlivery-common"

export const ProfileScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>({})
    const [nodeUrl, setNodeUrl] = useState<string>("")
    const [latitude, setLatitude] = useState<string>("")
    const [longitude, setLongitude] = useState<string>("")
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
            setLongitude(data.location.longitude)
            setLatitude(data.location.latitude)
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

    function handleAutofillLocation() {
        GeolocationUtils.getLocation().then(location => {
            if (location?.coords) {
                const { latitude, longitude } = location?.coords

                setLatitude(latitude.toString())
                setLongitude(longitude.toString())
            }
        })
    }

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

    function handleUpdateLocation() {
        if (!ValidationUtils.isValidLatitude(latitude)) {
            Toast.show({
                type: "error",
                text1: "Invalid latitude",
            })
            return
        }

        if (!ValidationUtils.isValidLongitude(longitude)) {
            Toast.show({
                type: "error",
                text1: "Invalid longitude",
            })
            return
        }

        const profileWithLocation = { ...profile, location: { latitude, longitude } }

        storageService.get(StoredKey.NSEC).then(async nsec => {
            const profileUpdateEvent = nostrService.signNostrEvent(nsec, 0, [], profileWithLocation)
            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", { event: profileUpdateEvent })

            try {
                await nodeService.postEvent(event)
                await storageService.set(StoredKey.PROFILE, profileWithLocation)
                Toast.show({
                    type: "success",
                    text1: "Location updated",
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

    function handleLogout() {
        storageService.remove(StoredKey.PROFILE).then()
        storageService.remove(StoredKey.NSEC).then()
        navigation.navigate("Login")
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
                <Text style={{ fontSize: 16, marginBottom: "2%" }}>Location</Text>
                {Platform.OS === 'android' && <ActionButton title={"Autofill Location"} color={"purple"} onPress={handleAutofillLocation} />}
                <Text style={{ fontSize: 16 }}>Latitude</Text>
                <TextInput
                    style={styles.input}
                    value={latitude}
                    keyboardType={"numeric"}
                    onChangeText={setLatitude}
                />
                <Text style={{ fontSize: 16 }}>Longitude</Text>
                <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                />
                <ActionButton
                    title={"Update"}
                    color={"purple"}
                    onPress={handleUpdateLocation}
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
