import { StorageService, StoredKey } from "./StorageService"
import { NostrEvent } from "../model/NostrEvent"
import {nip19, verifyEvent} from "nostr-tools"
import type {Filter} from "nostr-tools/lib/types/filter"
import {NostrService} from "./NostrService"
import { schnorr } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

export class NodeService {

    readonly storageService = new StorageService()
    readonly nostrService = new NostrService()
    readonly utf8Encoder: TextEncoder = new TextEncoder()

    async getNodeIdentity(nodeUrl: string) {
        const response = await fetch(nodeUrl + '/identity', {
            method: 'GET',
            headers: {
                Accept: 'text/plain',
                'Content-Type': 'text/plain',
            }
        })

        if (response.ok) {
            const nodeNpub = await response.text()
            await this.storageService.set(StoredKey.NODE_NPUB, nodeNpub)
            await this.storageService.set(StoredKey.NODE_URL, nodeUrl)
            return true
        } else {
            throw 'Invalid node url'
        }
    }

    async postNostrliveryEvent(kind: number, tags: string[][], content: any) {
        const nsec = await this.storageService.get(StoredKey.NSEC)

        const signedNostrEvent = this.nostrService.signNostrEvent(nsec, kind, tags, content)
        const nostrliveryEvent = this.nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: signedNostrEvent})

        return await this.postEvent(nostrliveryEvent)
    }

    async postEvent(event: NostrEvent) {
        const nodeUrl = await this.storageService.get(StoredKey.NODE_URL)

        const response = await fetch(nodeUrl + '/entrypoint', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        })

        if (response.ok) {
            const responseEvent = await response.json()
            const responseNostrEvent = new NostrEvent(responseEvent)

            if (verifyEvent(responseNostrEvent)) {
                return JSON.parse(responseNostrEvent.content)
            }
        } else {
            throw 'Invalid node url'
        }
    }

    async queryEvent(filter: Filter) {
        const nsec = await this.storageService.get(StoredKey.NSEC)
        const event = this.nostrService.signNostrliveryEvent(nsec, "QUERY_EVENT", {filter})

        return JSON.parse(await this.postEvent(event))
    }

    async queryEvents(filter: Filter): Promise<NostrEvent[]> {
        const nsec = await this.storageService.get(StoredKey.NSEC)
        const event = this.nostrService.signNostrliveryEvent(nsec, "QUERY_EVENTS", {filter})

        return JSON.parse(await this.postEvent(event))
    }

    async getUsername(npub: string) {
        const nodeUrl = await this.storageService.get(StoredKey.NODE_URL)
        const response = await fetch(nodeUrl + '/username/'+ npub, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        })

        if (response.ok) {
            const json = await response.json()

            const body = json["body"]
            const signature = json["signature"]

            await this.validateNodeSignature(body, signature)

            return body as string
        } else {
            throw 'Failed to get username'
        }
    }

    async validateNodeSignature(body: any, signature: string){
        const nodeNpub = await this.storageService.get(StoredKey.NODE_NPUB)
        const bodyHash = sha256(this.utf8Encoder.encode(body))
        if(!schnorr.verify(signature, bodyHash, nip19.decode(nodeNpub).data as Uint8Array)){
            throw 'Failed to verify response from node'
        }
    }
}