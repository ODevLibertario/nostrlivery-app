import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Platform } from 'react-native'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface QRScannerProps {
    onScan: (data: string) => void
    onClose: () => void
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)

    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:')
        } else {
            Linking.openSettings()
        }
    }

    const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
        if (scanned) return
        
        setScanned(true)
        
        // Check if the scanned data looks like an npub
        if (data.startsWith('npub1')) {
            onScan(data)
        } else {
            Alert.alert(
                'Invalid QR Code',
                'This QR code does not contain a valid driver NPUB. Please scan a driver\'s QR code.',
                [
                    {
                        text: 'Try Again',
                        onPress: () => setScanned(false)
                    },
                    {
                        text: 'Cancel',
                        onPress: onClose
                    }
                ]
            )
        }
    }

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Requesting camera permission...</Text>
            </View>
        )
    }

    if (!permission.granted) {
        const handleRequestPermission = async () => {
            const result = await requestPermission()
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Required',
                    'Camera access is required to scan QR codes. Please enable it in your device settings.',
                    [
                        {
                            text: 'Open Settings',
                            onPress: openSettings
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: onClose
                        }
                    ]
                )
            }
        }

        return (
            <View style={styles.container}>
                <View style={styles.permissionContainer}>
                    <MaterialCommunityIcons name="camera-off" color="#fff" size={64} />
                    <Text style={styles.message}>Camera permission is required</Text>
                    <Text style={styles.subMessage}>
                        Please grant camera access to scan driver QR codes
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={handleRequestPermission}>
                        <Text style={styles.buttonText}>Grant Permission</Text>
                    </TouchableOpacity>
                    {permission.canAskAgain === false && (
                        <>
                            <Text style={styles.subMessage}>
                                Permission was previously denied. Please enable it in settings.
                            </Text>
                            <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={openSettings}>
                                <Text style={styles.buttonText}>Open Settings</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Scan Driver QR Code</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <MaterialCommunityIcons name="close" color="#fff" size={24} />
                </TouchableOpacity>
            </View>
            
            <View style={styles.cameraContainer}>
                <CameraView
                    style={styles.camera}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                />
                <View style={styles.overlay}>
                    <View style={styles.scanArea} />
                </View>
            </View>
            
            <View style={styles.footer}>
                <Text style={styles.instructions}>
                    Position the QR code within the frame to scan
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#2f1650',
        zIndex: 1001,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 5,
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: '#2f1650',
        backgroundColor: 'transparent',
        borderRadius: 10,
        shadowColor: '#2f1650',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
    },
    footer: {
        padding: 20,
        backgroundColor: '#2f1650',
        alignItems: 'center',
        zIndex: 1001,
    },
    instructions: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    message: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    subMessage: {
        color: '#aaa',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#2f1650',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
        minWidth: 200,
    },
    settingsButton: {
        backgroundColor: '#4a2c7a',
    },
    closeButton: {
        backgroundColor: '#666',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})
