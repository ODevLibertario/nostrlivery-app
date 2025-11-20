import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { NostrService } from '@odevlibertario/nostrlivery-common'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface EventLog {
    id: string
    kind: number
    content: string
    pubkey: string
    created_at: number
    timestamp: string
}

export const RelayVerifier: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [events, setEvents] = useState<EventLog[]>([])
    const [isListening, setIsListening] = useState(false)
    const [driverNpub, setDriverNpub] = useState('')
    const [subscription, setSubscription] = useState<any>(null)
    const nostrService = new NostrService()

    const startListening = async () => {
        try {
            setIsListening(true)
            const relay = await nostrService['connectToRelay']()
            
            // Subscribe to all ephemeral events (kind 20000)
            const sub = relay.subscribe([
                {
                    kinds: [20000],
                    limit: 50
                }
            ], {
                onevent: (event: any) => {
                    const eventLog: EventLog = {
                        id: event.id,
                        kind: event.kind,
                        content: event.content,
                        pubkey: event.pubkey,
                        created_at: event.created_at,
                        timestamp: new Date(event.created_at * 1000).toISOString()
                    }
                    
                    setEvents(prev => [eventLog, ...prev.slice(0, 49)]) // Keep last 50 events
                },
                oneose: () => {
                    console.log('End of stored events')
                }
            })

            setSubscription(sub)
            console.log('Started listening for ephemeral events...')
        } catch (error) {
            console.error('Error starting listener:', error)
            Alert.alert('Error', 'Failed to start listening to relay')
            setIsListening(false)
        }
    }

    const stopListening = () => {
        if (subscription) {
            subscription.close()
            setSubscription(null)
        }
        setIsListening(false)
        console.log('Stopped listening for ephemeral events')
    }

    const testDriverAssociation = async () => {
        if (!driverNpub.trim()) {
            Alert.alert('Error', 'Please enter a driver npub')
            return
        }

        try {
            const associationRequest = {
                type: "DRIVER_ASSOCIATION_REQUEST",
                driverNpub: driverNpub.trim()
            }

            await nostrService.publishEphemeralEvent(20000, JSON.stringify(associationRequest))
            Alert.alert('Success', 'Test association request sent!')
        } catch (error) {
            console.error('Error sending test request:', error)
            Alert.alert('Error', 'Failed to send test request')
        }
    }

    const clearEvents = () => {
        setEvents([])
    }

    // Cleanup subscription on unmount
    useEffect(() => {
        return () => {
            if (subscription) {
                subscription.close()
            }
        }
    }, [subscription])

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Relay Event Verifier</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <MaterialCommunityIcons name="close" color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.controls}>
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.button, isListening ? styles.stopButton : styles.startButton]} 
                        onPress={isListening ? stopListening : startListening}
                    >
                        <Text style={styles.buttonText}>
                            {isListening ? 'Stop Listening' : 'Start Listening'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.clearButton} onPress={clearEvents}>
                        <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.testSection}>
                    <Text style={styles.sectionTitle}>Test Driver Association</Text>
                    <Text style={styles.inputLabel}>Driver NPUB:</Text>
                    <Text style={styles.inputField} numberOfLines={1}>
                        {driverNpub || 'Enter driver npub...'}
                    </Text>
                    <TouchableOpacity style={styles.testButton} onPress={testDriverAssociation}>
                        <Text style={styles.buttonText}>Send Test Request</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>
                    Ephemeral Events (Kind 20000) - {events.length} received
                </Text>
                {events.length === 0 ? (
                    <Text style={styles.noEvents}>No events received yet. Start listening to see events.</Text>
                ) : (
                    events.map((event, index) => (
                        <View key={`${event.id}-${index}`} style={styles.eventCard}>
                            <View style={styles.eventHeader}>
                                <Text style={styles.eventId}>{event.id.substring(0, 16)}...</Text>
                                <Text style={styles.eventTime}>{event.timestamp}</Text>
                            </View>
                            <Text style={styles.eventKind}>Kind: {event.kind}</Text>
                            <Text style={styles.eventPubkey}>From: {event.pubkey.substring(0, 16)}...</Text>
                            <Text style={styles.eventContent} numberOfLines={3}>
                                {event.content}
                            </Text>
                        </View>
                    ))
                )}
            </ScrollView>
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
        zIndex: 2000,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#2f1650',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 5,
    },
    controls: {
        padding: 20,
        backgroundColor: '#1a1a1a',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: '#4CAF50',
    },
    stopButton: {
        backgroundColor: '#f44336',
    },
    clearButton: {
        backgroundColor: '#ff9800',
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    testSection: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputLabel: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 5,
    },
    inputField: {
        color: '#fff',
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        fontFamily: 'monospace',
    },
    testButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    eventsContainer: {
        flex: 1,
        padding: 20,
    },
    eventsTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    noEvents: {
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
    eventCard: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#2f1650',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    eventId: {
        color: '#4CAF50',
        fontFamily: 'monospace',
        fontSize: 12,
    },
    eventTime: {
        color: '#999',
        fontSize: 12,
    },
    eventKind: {
        color: '#2196F3',
        fontSize: 12,
        marginBottom: 4,
    },
    eventPubkey: {
        color: '#ff9800',
        fontFamily: 'monospace',
        fontSize: 12,
        marginBottom: 8,
    },
    eventContent: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 18,
    },
})
