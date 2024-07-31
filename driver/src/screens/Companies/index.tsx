import {useEffect, useState} from "react"
import {NodeService, NostrEventKinds, StorageService, StoredKey} from "@odevlibertario/nostrlivery-common"
import {Card} from "react-native-paper"
import {Text, View} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {getPublicKey, nip19} from "nostr-tools";
import {CompanyAssociation, CompanyAssociationStatus} from "@model/CompanyAssociation";

export const CompaniesScreen = ({ navigation }: any) => {
    const [companyAssociations, setCompanyAssociations] = useState<CompanyAssociation[]>([])

    const storageService = new StorageService()
    const nodeService = new NodeService()

    function hasTag(tags: string[][], name: string, value: string) {
       return tags.filter(tag => tag[0] === name && tag[1] == value)[0][1] != undefined;
    }

    useEffect(() => {
        storageService.get(StoredKey.NSEC).then(nsec => {
            nodeService.queryEvents({
                kinds: [NostrEventKinds.DRIVER_ASSOCIATION],
                authors: [getPublicKey(nip19.decode(nsec).data as Uint8Array)],
                '#type': ['DRIVER_ASSOCIATION_REQUEST', 'DRIVER_ASSOCIATION_REJECTION', 'DRIVER_ASSOCIATION'],
                '#driverNpub': [nip19.npubEncode(getPublicKey(nsec))]
            }).then(events => {
                events
                    .map(event => {
                    const isDriverAssociationRequest = hasTag(event.tags, 'type', 'DRIVER_ASSOCIATION_REQUEST');

                    if(isDriverAssociationRequest &&
                        events.find(e => hasTag(e.tags, 'type', 'DRIVER_ASSOCIATION_REJECTION') && e.created_at > event.created_at) == undefined) {
                        return nodeService.getUsername(event.pubkey).then(companyName => {
                            new CompanyAssociation(companyName, CompanyAssociationStatus.PENDING);
                        }).catch(e => console.log(e))
                    }

                    const isDriverAssociation = event.tags.filter(tag => tag[0] === 'type' && tag[1] == 'DRIVER_ASSOCIATION')[0][1] != undefined;

                    if(isDriverAssociation && JSON.parse(event.content)['removed'] != true) {
                        return nodeService.getUsername(event.pubkey).then(companyName => {
                            new CompanyAssociation(companyName, CompanyAssociationStatus.ACCEPTED);
                        }).catch(e => console.log(e))
                    }
                })
            })
        })
    }, [])


    return (
        <Card style={{ margin: '2%', maxHeight: 140 }} onPress={() => navigation.navigate("Menu")}>
            <Card.Title title="Company 1" titleStyle={{ alignSelf: 'flex-start', fontWeight: 'bold' }} />
            <Card.Content>
                <Text>Status: Pending</Text>
            </Card.Content>
            <Card.Actions>
                <View style={{flexDirection: 'row'}}>
                    <FontAwesome name="check"  size={25} />
                    <FontAwesome name="times"  size={25} />
                    <FontAwesome name="trash"  size={25} />
                </View>
            </Card.Actions>
        </Card>
    )
}
