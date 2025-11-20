import {useEffect, useState} from "react"

import {Card, Button, Portal, Modal, Text} from "react-native-paper"
import {View, StyleSheet, TouchableOpacity, ScrollView} from "react-native"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import {DriverNodeService} from "@service/DriverNodeService"
import {type EntityAssociation, EntityAssociationStatus} from "@model/EntityAssociation"
import {NostrEventKinds, NostrService, StorageService, StoredKey} from "@odevlibertario/nostrlivery-common"

export const CompaniesScreen = ({navigation}: any) => {
    const [companyAssociations, setCompanyAssociations] = useState<EntityAssociation[]>([])
    const [associationRequests, setAssociationRequests] = useState<any[]>([])
    const [showRequests, setShowRequests] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [unsubscribeFunction, setUnsubscribeFunction] = useState<(() => void) | null>(null)
    const [profile, setProfile] = useState<any>({})

    const driverNodeService = new DriverNodeService()
    const storageService = new StorageService()
    const nostrService = new NostrService()

    useEffect(() => {
        // Load profile
        storageService.get(StoredKey.PROFILE).then((data: any) => {
            if (data) {
                setProfile(data)
            }
        })
        
        // Load company associations
        driverNodeService.getCompanyAssociations()
            .then(companyAssociations => setCompanyAssociations(companyAssociations))
            .catch(e => console.log(e))
    }, [])

    useEffect(() => {
        console.log("🔄 Companies useEffect called - profile:", !!profile, "isListening:", isListening, "unsubscribeFunction:", !!unsubscribeFunction)
        
        if (profile && !isListening && !unsubscribeFunction) {
            console.log("✅ Conditions met, starting to listen...")
            startListeningForRequests()
        } else {
            console.log("❌ Conditions not met, skipping...")
        }
        
        return () => {
            console.log("🧹 Companies useEffect cleanup called")
            if (unsubscribeFunction) {
                stopListeningForRequests()
            }
        }
    }, [profile])

    const startListeningForRequests = async () => {
        try {
            console.log("🚀 Companies startListeningForRequests called")
            console.log("Current state - isListening:", isListening, "unsubscribeFunction:", !!unsubscribeFunction)
            
            if (isListening || unsubscribeFunction) {
                console.log("⚠️ Already listening or has unsubscribe function, skipping...")
                return
            }
            
            setIsListening(true)
            console.log("Starting to listen for association requests...")
            
            const unsubscribe = await nostrService.subscribeToEphemeralEvents(
                (event) => {
                    console.log("Companies screen received event:", {
                        id: event.id,
                        kind: event.kind,
                        pubkey: event.pubkey,
                        content: event.content,
                        created_at: event.created_at
                    })
                    
                    try {
                        // Handle double-encoded JSON content
                        let contentString = event.content
                        if (contentString.startsWith('"') && contentString.endsWith('"')) {
                            contentString = JSON.parse(contentString)
                        }
                        
                        const content = JSON.parse(contentString)
                        console.log("Parsed content:", content)
                        console.log("Content type:", content.type)
                        
                        if (content.type === "DRIVER_ASSOCIATION_REQUEST") {
                            console.log("✅ Received association request:", content)
                            setAssociationRequests(prev => [...prev, {
                                id: event.id,
                                companyPubkey: event.pubkey,
                                driverNpub: content.driverNpub,
                                timestamp: new Date(event.created_at * 1000),
                                event: event
                            }])
                        } else {
                            console.log("Event is not a DRIVER_ASSOCIATION_REQUEST, type:", content.type)
                        }
                    } catch (error) {
                        console.error("Error parsing event content:", error)
                        console.log("Raw content that failed to parse:", event.content)
                    }
                },
                () => {
                    console.log("End of stored events - listening for new events...")
                }
            )
            
            // Store unsubscribe function for cleanup
            setUnsubscribeFunction(() => unsubscribe)
            
        } catch (error) {
            console.error("Error starting association request listener:", error)
            setIsListening(false)
        }
    }

    const stopListeningForRequests = () => {
        try {
            if (unsubscribeFunction) {
                unsubscribeFunction()
                setUnsubscribeFunction(null)
            }
            setIsListening(false)
            console.log("Stopped listening for association requests")
        } catch (error) {
            console.error("Error stopping association request listener:", error)
        }
    }

    const handleAcceptRequest = async (request: any) => {
        console.log("Accepting association request:", request)
        
        try {
            // Send acceptance response to company
            const responseContent = {
                type: "DRIVER_ASSOCIATION_ACCEPTED",
                companyPubkey: request.companyPubkey,
                driverNpub: request.driverNpub,
                originalRequestId: request.id
            }
            
            // Get driver's nsec for signing
            const driverNsec = await storageService.get(StoredKey.NSEC)
            if (driverNsec) {
                await nostrService.publishEphemeralEvent(20000, JSON.stringify(responseContent), driverNsec)
            } else {
                console.error("Driver nsec not found, cannot sign response")
                await nostrService.publishEphemeralEvent(20000, JSON.stringify(responseContent))
            }
            console.log("✅ Sent acceptance response to company")
            
            // Convert the request to an association and add it to the list
            const newAssociation: EntityAssociation = {
                entityNpub: request.companyPubkey,
                entityName: "Company", // Default name, could be fetched from profile
                status: EntityAssociationStatus.ACCEPTED,
            }
            setCompanyAssociations(prev => [...prev, newAssociation])
            
            // Remove from requests
            setAssociationRequests(prev => prev.filter(req => req.id !== request.id))
        } catch (error) {
            console.error("Error sending acceptance response:", error)
        }
    }

    const handleRejectRequest = async (request: any) => {
        console.log("Rejecting association request:", request)
        
        try {
            // Send rejection response to company
            const responseContent = {
                type: "DRIVER_ASSOCIATION_REJECTED",
                companyPubkey: request.companyPubkey,
                driverNpub: request.driverNpub,
                originalRequestId: request.id
            }
            
            // Get driver's nsec for signing
            const driverNsec = await storageService.get(StoredKey.NSEC)
            if (driverNsec) {
                await nostrService.publishEphemeralEvent(20000, JSON.stringify(responseContent), driverNsec)
            } else {
                console.error("Driver nsec not found, cannot sign response")
                await nostrService.publishEphemeralEvent(20000, JSON.stringify(responseContent))
            }
            console.log("❌ Sent rejection response to company")
            
            // Remove from requests
            setAssociationRequests(prev => prev.filter(req => req.id !== request.id))
        } catch (error) {
            console.error("Error sending rejection response:", error)
        }
    }

    async function acceptAssociationRequest(companyNpub: string) {
        await driverNodeService.postNostrliveryEvent(NostrEventKinds.REGULAR.valueOf(), [["type", "DRIVER_ASSOCIATION"]], {companyNpub})
        const updatedAssociations = companyAssociations.map(it =>
            it.entityNpub === companyNpub
                ? {...it, status: EntityAssociationStatus.ACCEPTED}
                : it
        )
        setCompanyAssociations(updatedAssociations)
    }

    async function rejectAssociationRequest(companyNpub: string) {
        // TODO should be of kind ephemeral but it's not working with the local relay
        await driverNodeService.postNostrliveryEvent(NostrEventKinds.EPHEMERAL.valueOf(), [["type", "DRIVER_ASSOCIATION_REJECTION"]], {companyNpub})

        const updatedAssociations = companyAssociations.filter(it =>
            it.entityNpub !== companyNpub
        )
        setCompanyAssociations(updatedAssociations)
    }

    async function removeCompanyAssociation(companyNpub: string) {
        await driverNodeService.postNostrliveryEvent(NostrEventKinds.REGULAR, [["type", "DRIVER_ASSOCIATION"]], {
            companyNpub,
            removed: true
        })
        const updatedAssociations = companyAssociations.filter(it =>
            it.entityNpub !== companyNpub
        )
        setCompanyAssociations(updatedAssociations)
    }

    return (
        <ScrollView style={styles.container}>
            {/* Association Requests Section */}
            <Card style={{margin: '2%'}}>
                <Card.Content>
                    <Text variant="titleMedium">Association Requests</Text>
                    <Text variant="bodyMedium">{isListening ? "Listening for requests..." : "Not listening"}</Text>
                    <Text variant="bodySmall">Requests: {associationRequests.length}</Text>
                    <Button mode="outlined" onPress={() => setShowRequests(true)} style={{marginTop: 10}}>
                        View Requests ({associationRequests.length})
                    </Button>
                </Card.Content>
            </Card>

            {/* Company Associations */}
            {companyAssociations?.map((companyAssociation, index) => (
                <Card style={{margin: '2%', maxHeight: 140}} key={index}>
                    <Card.Title title="Company 1" titleStyle={{alignSelf: 'flex-start', fontWeight: 'bold'}}/>
                    <Card.Content>
                        <Text
                            style={{textTransform: 'capitalize'}}>Status: {EntityAssociationStatus[companyAssociation.status]}</Text>
                    </Card.Content>
                    <Card.Actions>
                        <View style={{flexDirection: 'row'}}>
                            {companyAssociation.status === EntityAssociationStatus.PENDING &&
                                <>
                                    <TouchableOpacity onPress={async () => await acceptAssociationRequest(companyAssociation.entityNpub)}>
                                        <FontAwesome name="check" size={30} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={async () => await rejectAssociationRequest(companyAssociation.entityNpub)}>
                                        <FontAwesome name="times" size={30} />
                                    </TouchableOpacity>
                                </>
                            }
                            {companyAssociation.status === EntityAssociationStatus.ACCEPTED &&
                                <TouchableOpacity onPress={async () => await removeCompanyAssociation(companyAssociation.entityNpub)}>
                                    <FontAwesome name="trash" size={25} />
                                </TouchableOpacity>
                            }
                        </View>
                    </Card.Actions>
                </Card>
            ))}

            {/* Association Requests Modal */}
            <Portal>
                <Modal visible={showRequests} onDismiss={() => setShowRequests(false)} contentContainerStyle={styles.modal}>
                    <ScrollView>
                        <Text variant="headlineSmall" style={styles.modalTitle}>Association Requests</Text>
                        {associationRequests.length === 0 ? (
                            <Text variant="bodyMedium" style={styles.noRequestsText}>
                                No pending association requests
                            </Text>
                        ) : (
                            associationRequests.map((request, index) => (
                                <Card key={request.id} style={styles.requestCard}>
                                    <Card.Content>
                                        <Text variant="titleMedium">Request #{index + 1}</Text>
                                        <Text variant="bodyMedium">Company: {request.companyPubkey.substring(0, 20)}...</Text>
                                        <Text variant="bodyMedium">Driver: {request.driverNpub}</Text>
                                        <Text variant="bodySmall">Time: {request.timestamp.toLocaleString()}</Text>
                                        <View style={styles.buttonRow}>
                                            <Button mode="contained" onPress={() => handleAcceptRequest(request)} style={styles.acceptButton}>
                                                Accept
                                            </Button>
                                            <Button mode="outlined" onPress={() => handleRejectRequest(request)} style={styles.rejectButton}>
                                                Reject
                                            </Button>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        )}
                        <Button mode="outlined" onPress={() => setShowRequests(false)} style={styles.closeButton}>
                            Close
                        </Button>
                    </ScrollView>
                </Modal>
            </Portal>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    modal: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%',
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#2f1650',
    },
    noRequestsText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    requestCard: {
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    acceptButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        flex: 1,
        marginLeft: 8,
        borderColor: '#f44336',
    },
    closeButton: {
        marginTop: 20,
        alignSelf: 'center',
    },
})
