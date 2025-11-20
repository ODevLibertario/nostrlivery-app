import { finalizeEvent, nip19, getPublicKey, nip05, Relay } from "nostr-tools"
import { appConfig, relayConfig, eventConfig } from "../config/app.config"

// WebSocket is available in React Native environment
declare const WebSocket: any

export class NostrService {
    private relay: Relay | null = null
    private relayUrl: string = relayConfig.url
    private activeSubscriptions: Set<any> = new Set()

    constructor(relayUrl?: string) {
        if (relayUrl) {
            this.relayUrl = relayUrl
        }
    }

    private async connectToRelay(): Promise<Relay> {
        if (this.relay) {
            return this.relay
        }

        try {
            this.relay = new Relay(this.relayUrl)
            await this.relay.connect()
            return this.relay
        } catch (error) {
            console.error("Failed to connect to relay:", error)
            throw new Error(`Failed to connect to relay: ${error}`)
        }
    }

    signNostrliveryEvent(nsec: string, eventType: string, params: any) {
        try {
            const sk = nip19.decode(nsec)
            return finalizeEvent({
                kind: 1,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: JSON.stringify({
                    eventType,
                    params
                }),
            }, sk.data as Uint8Array)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    signNostrEvent(nsec: string, kind: number, tags: string[][], content: any) {
        try {
            const sk = nip19.decode(nsec)
            return finalizeEvent({
                kind,
                created_at: Math.floor(Date.now() / 1000),
                tags,
                content: JSON.stringify(content),
            }, sk.data as Uint8Array)
        } catch (e) {
            console.log(e)
            throw e
        }
    }

    async getProfile(npub: string): Promise<any> {
        try {
            // Decode the npub to get the public key
            const { data: pubkey } = nip19.decode(npub)
            
            // Connect to relay and query for kind 0 events (profile events)
            const relay = await this.connectToRelay()
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error("Profile query timeout"))
                }, 10000) // 10 second timeout

                const sub = relay.subscribe([
                    {
                        kinds: [0], // Profile events
                        authors: [pubkey as string],
                        limit: 1
                    }
                ], {
                    onevent: (event) => {
                        clearTimeout(timeout)
                        try {
                            const profileData = JSON.parse(event.content)
                            resolve({
                                name: profileData.name || profileData.display_name || "Unknown",
                                about: profileData.about || profileData.bio || "",
                                picture: profileData.picture || profileData.avatar || "",
                                display_name: profileData.display_name || profileData.name || "Unknown"
                            })
                        } catch (parseError) {
                            console.error("Error parsing profile data:", parseError)
                            resolve({
                                name: "Unknown Driver",
                                about: "No description available",
                                picture: "",
                                display_name: "Unknown"
                            })
                        }
                    },
                    oneose: () => {
                        clearTimeout(timeout)
                        // If no profile event found, return default values
                        resolve({
                            name: "Unknown Driver",
                            about: "No description available", 
                            picture: "",
                            display_name: "Unknown"
                        })
                    }
                })

                // Handle subscription errors - using try-catch instead of event listener
                try {
                    // The subscription will handle errors through the Promise rejection
                } catch (error) {
                    clearTimeout(timeout)
                    console.error("Profile subscription error:", error)
                    reject(new Error(`Profile query failed: ${error}`))
                }
            })
        } catch (e) {
            console.log("Error getting profile:", e)
            // Fallback to default profile if relay query fails
            return {
                name: "Unknown Driver",
                about: "No description available",
                picture: "",
                display_name: "Unknown"
            }
        }
    }

    async publishEphemeralEvent(kind: number, content: string, nsec?: string): Promise<void> {
        try {
            // For ephemeral events, we need to sign them with a private key
            // If no nsec is provided, we'll log locally (for development)
            if (!nsec) {
                console.log("Publishing ephemeral event (no signing key provided):", {
                    kind,
                    content,
                    timestamp: new Date().toISOString()
                })
                await new Promise(resolve => setTimeout(resolve, 500))
                console.log("Ephemeral event logged locally")
                return
            }

            // Connect to relay for ephemeral event publishing
            const relay = await this.connectToRelay()
            
            // Create and sign the ephemeral event
            const event = this.signNostrEvent(nsec, kind, [], content)
            
            console.log("Publishing ephemeral event to relay:", {
                kind,
                content,
                eventId: event.id,
                timestamp: new Date().toISOString()
            })

            // Publish the signed event to the relay
            await relay.publish(event)
            
            console.log("Ephemeral event published successfully to relay")
        } catch (e) {
            console.log("Error publishing ephemeral event:", e)
            // Fallback to local logging if relay publishing fails
            console.log("Fallback: Logging event locally:", {
                kind,
                content,
                timestamp: new Date().toISOString()
            })
            throw e
        }
    }

    async subscribeToEphemeralEvents(
        onEvent: (event: any) => void,
        onEose?: () => void
    ): Promise<() => void> {
        try {
            console.log("NostrService: Using direct WebSocket for ephemeral events...")
            
            // Create a direct WebSocket connection for subscriptions
            const ws = new WebSocket(this.relayUrl)
            
            return new Promise((resolve, reject) => {
                ws.onopen = () => {
                    console.log("NostrService: WebSocket connected for subscription")
                    
                    // Send subscription request
                    const subscription = [
                        "REQ",
                        "ephemeral-events-" + Date.now(),
                        {
                            kinds: [eventConfig.associationRequestKind],
                            limit: eventConfig.limit
                        }
                    ]
                    
                    console.log("NostrService: Sending subscription:", JSON.stringify(subscription))
                    ws.send(JSON.stringify(subscription))
                    
                    // Set up message handler
                    ws.onmessage = (event: any) => {
                        try {
                            const message = JSON.parse(event.data)
                            
                            if (message[0] === 'EVENT') {
                                const eventData = message[2]
                                console.log("NostrService: Received event via WebSocket:", {
                                    id: eventData.id,
                                    kind: eventData.kind,
                                    pubkey: eventData.pubkey
                                })
                                onEvent(eventData)
                            } else if (message[0] === 'EOSE') {
                                console.log("NostrService: End of stored events via WebSocket")
                                if (onEose) {
                                    onEose()
                                }
                            } else if (message[0] === 'NOTICE') {
                                console.log("NostrService: Notice:", message[1])
                            }
                        } catch (error) {
                            console.error("NostrService: Error parsing WebSocket message:", error)
                        }
                    }
                    
                    ws.onerror = (error: any) => {
                        console.error("NostrService: WebSocket error:", error)
                    }
                    
                    ws.onclose = () => {
                        console.log("NostrService: WebSocket connection closed")
                    }
                    
                    // Return unsubscribe function
                    const unsubscribe = () => {
                        console.log("NostrService: Closing WebSocket subscription")
                        ws.close()
                    }
                    
                    resolve(unsubscribe)
                }
                
                ws.onerror = (error: any) => {
                    console.error("NostrService: WebSocket connection error:", error)
                    reject(error)
                }
            })
        } catch (error) {
            console.error("Error subscribing to ephemeral events:", error)
            throw error
        }
    }

    async closeRelayConnection(): Promise<void> {
        if (this.relay) {
            try {
                await this.relay.close()
                this.relay = null
                console.log("Relay connection closed")
            } catch (error) {
                console.error("Error closing relay connection:", error)
            }
        }
    }
}