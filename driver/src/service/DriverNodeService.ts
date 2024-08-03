import {NodeService} from "@odevlibertario/nostrlivery-common";
import {StoredKey} from "@odevlibertario/nostrlivery-common/src/service/StorageService";
import {CompanyAssociation} from "@model/CompanyAssociation";
import {getPublicKey, nip19} from "nostr-tools";

export class DriverNodeService extends NodeService {

    async getCompanyAssociations(): Promise<CompanyAssociation[]> {
        const nodeUrl = await this.storageService.get(StoredKey.NODE_URL)
        const nsec = await this.storageService.get(StoredKey.NSEC)
        const npub = nip19.npubEncode(getPublicKey(nsec))
        const response = await fetch(nodeUrl + '/driver/company-associations/'+ npub, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
        })

        if (response.ok) {
            const json = await response.json()

            const signature = json["signature"]
            const body = json["body"]

            await this.validateNodeSignature(signature, body)

            return JSON.parse(json["body"]) as CompanyAssociation[]
        } else {
            throw 'Failed to get company associations'
        }
    }

}