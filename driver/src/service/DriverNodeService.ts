import {NodeService} from "@odevlibertario/nostrlivery-common"
import {StoredKey} from "@odevlibertario/nostrlivery-common/src/service/StorageService"
import {getPublicKey, nip19} from "nostr-tools"
import {type EntityAssociation} from "@model/EntityAssociation"

export class DriverNodeService extends NodeService {

    async getCompanyAssociations(): Promise<EntityAssociation[]> {
        const nodeUrl = await this.storageService.get(StoredKey.NODE_URL)
        const nsec = await this.storageService.get(StoredKey.NSEC)
        const npub = nip19.npubEncode(getPublicKey(nip19.decode(nsec).data as Uint8Array))

        const response = await fetch(nodeUrl + '/driver/company-associations/'+ npub, {
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

            return body as EntityAssociation[]
        } else {
            throw 'Failed to get company associations'
        }
    }

}