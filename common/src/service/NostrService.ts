import { finalizeEvent, nip19 } from "nostr-tools"

export class NostrService {

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
}