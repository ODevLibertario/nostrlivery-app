import { StorageService, StoredKey } from "./StorageService"
import { NostrEvent } from "../model/NostrEvent"
import { verifyEvent } from "nostr-tools"
import type {Filter} from "nostr-tools/lib/types/filter"
import {NostrService} from "./NostrService";

export class NodeService {

    private readonly storageService = new StorageService()
    private readonly nostrService = new NostrService()

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

}