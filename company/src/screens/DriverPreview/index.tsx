import React, { useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    Image,
} from "react-native"
import { Button, Card, Title, Paragraph } from "react-native-paper"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Toast from "react-native-toast-message"
import { NostrService, StorageService, StoredKey } from "@odevlibertario/nostrlivery-common"

interface DriverProfile {
    name?: string
    about?: string
    picture?: string
    display_name?: string
}

export const DriverPreviewScreen = ({ navigation, route }: any) => {
    const { driverNpub, profile, onRequestSent } = route.params
    const [isAssociating, setIsAssociating] = useState(false)
    const storageService = new StorageService()

    const handleAssociateDriver = async () => {
        setIsAssociating(true)
        try {
            const nostrService = new NostrService()
            
            // Get company's nsec for signing the ephemeral event
            const nsec = await storageService.get(StoredKey.NSEC)
            
            // Create ephemeral event of kind 20000
            const associationRequest = {
                type: "DRIVER_ASSOCIATION_REQUEST",
                driverNpub: driverNpub
            }

            await nostrService.publishEphemeralEvent(20000, JSON.stringify(associationRequest), nsec)
            
            // Add request to the list if callback is provided
            if (onRequestSent) {
                const driverName = profile?.display_name || profile?.name || "Unknown Driver"
                const requestId = Date.now().toString() // Generate a simple request ID
                onRequestSent(driverNpub, driverName, requestId)
            }
            
            // Show green success toast
            Toast.show({
                type: "success",
                text1: "Association request sent!",
                text2: "Driver will be notified of your request"
            })
            
            // Navigate back to drivers tab
            navigation.navigate("Drivers")
        } catch (error) {
            console.error("Error sending association request:", error)
            Toast.show({
                type: "error",
                text1: "Failed to send association request",
                text2: "Please try again"
            })
        } finally {
            setIsAssociating(false)
        }
    }

    const displayName = profile?.display_name || profile?.name || "Unknown Driver"
    const about = profile?.about || "No description available"
    const picture = profile?.picture

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Title style={styles.title}>Driver Preview</Title>
            </View>

            <Card style={styles.profileCard}>
                <Card.Content style={styles.profileContent}>
                    {picture ? (
                        <Image source={{ uri: picture }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <MaterialCommunityIcons 
                                name="account" 
                                size={40} 
                                color="#666" 
                            />
                        </View>
                    )}
                    
                    <View style={styles.profileInfo}>
                        <Title style={styles.driverName}>{displayName}</Title>
                        <Paragraph style={styles.driverAbout}>{about}</Paragraph>
                        <Text style={styles.driverNpub}>NPUB: {driverNpub}</Text>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.actionContainer}>
                <Button
                    mode="contained"
                    onPress={handleAssociateDriver}
                    disabled={isAssociating}
                    style={styles.associateButton}
                    contentStyle={styles.buttonContent}
                >
                    Associate Driver
                </Button>
                
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate("Drivers")}
                    disabled={isAssociating}
                    style={styles.cancelButton}
                    contentStyle={styles.buttonContent}
                >
                    Cancel
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2f1650",
    },
    profileCard: {
        marginBottom: 30,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    profileContent: {
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        borderWidth: 1,
        borderColor: "#d0d0d0",
    },
    profileInfo: {
        flex: 1,
    },
    driverName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2f1650",
        marginBottom: 8,
    },
    driverAbout: {
        fontSize: 14,
        color: "#666",
        marginBottom: 12,
        lineHeight: 20,
    },
    driverNpub: {
        fontSize: 12,
        color: "#999",
        fontFamily: "monospace",
    },
    actionContainer: {
        flex: 1,
        justifyContent: "flex-end",
        paddingBottom: 20,
    },
    associateButton: {
        marginBottom: 12,
        backgroundColor: "#2f1650",
    },
    cancelButton: {
        borderColor: "#2f1650",
    },
    buttonContent: {
        paddingVertical: 8,
    },
})
