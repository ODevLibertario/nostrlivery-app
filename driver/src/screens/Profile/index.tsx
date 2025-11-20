import { useEffect, useState } from "react"
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from "react-native"
import Toast from "react-native-toast-message"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import QRCode from "react-native-qrcode-svg"
import { getPublicKey, nip19 } from "nostr-tools"
import * as Clipboard from 'expo-clipboard'
import {
    StorageService,
    NostrService,
    NodeService,
    StoredKey,
    SelectInput,
    ActionButton
} from "@odevlibertario/nostrlivery-common"

export const ProfileScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>({})
    const [nodeUrl, setNodeUrl] = useState<string>("")
    const [paymentRate, setPaymentRate] = useState<string>("")
    const [disabledNodeUrlBtn, setDisabledNodeUrlBtn] = useState<boolean>(true)
    const [npub, setNpub] = useState<string>("")
    const storageService = new StorageService()
    const nodeService = new NodeService()
    const nostrService = new NostrService()

    const generateNpub = async () => {
        try {
            const nsec = await storageService.get(StoredKey.NSEC)
            if (nsec) {
                const npub = nip19.npubEncode(getPublicKey(nip19.decode(nsec).data as Uint8Array))
                setNpub(npub)
            }
        } catch (error) {
            console.error("Error generating npub:", error)
        }
    }

    const copyNpubToClipboard = async () => {
        try {
            await Clipboard.setStringAsync(npub)
            Toast.show({
                type: "success",
                text1: "NPUB copied to clipboard",
            })
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to copy NPUB",
            })
        }
    }

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

        // Generate npub from stored nsec
        generateNpub()
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
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
            
            {/* NPUB QR Code Section */}
            {npub && (
                <View style={styles.npubContainer}>
                    <Text style={styles.sectionTitle}>Your NPUB (Driver ID)</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={npub}
                            size={200}
                            color="#000000"
                            backgroundColor="#FFFFFF"
                        />
                    </View>
                    <View style={styles.npubTextContainer}>
                        <Text style={styles.npubText} numberOfLines={2} ellipsizeMode="middle">
                            {npub}
                        </Text>
                        <TouchableOpacity 
                            style={styles.copyButton} 
                            onPress={copyNpubToClipboard}
                        >
                            <MaterialCommunityIcons name="content-copy" color="#2f1650" size={20} />
                            <Text style={styles.copyButtonText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            
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
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    profileContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 25,
        gap: 15,
        paddingBottom: 40, // Extra padding at bottom for better scrolling
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
    npubContainer: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#e9ecef",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2f1650",
        marginBottom: 15,
        textAlign: "center",
    },
    qrContainer: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    npubTextContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        backgroundColor: "#ffffff",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#dee2e6",
    },
    npubText: {
        fontSize: 12,
        color: "#6c757d",
        fontFamily: "monospace",
        flex: 1,
        marginRight: 10,
    },
    copyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2f1650",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    copyButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 5,
    },
})
