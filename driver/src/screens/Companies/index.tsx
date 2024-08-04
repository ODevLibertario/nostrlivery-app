import {useEffect, useState} from "react"

import {Card} from "react-native-paper"
import {Text, View} from "react-native"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import {DriverNodeService} from "@service/DriverNodeService"
import {type EntityAssociation, EntityAssociationStatus} from "@model/EntityAssociation"
import {NostrEventKinds} from "@odevlibertario/nostrlivery-common"

export const CompaniesScreen = ({navigation}: any) => {
    const [companyAssociations, setCompanyAssociations] = useState<EntityAssociation[]>([])

    const driverNodeService = new DriverNodeService()

    useEffect(() => {
        driverNodeService.getCompanyAssociations()
            .then(companyAssociations => setCompanyAssociations(companyAssociations))
            .catch(e => console.log(e))
    }, [])

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

    return (companyAssociations?.map((companyAssociation, index) => (
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
                            <FontAwesome name="check" size={30} onPress={async () => await acceptAssociationRequest(companyAssociation.entityNpub)}/>
                            <FontAwesome name="times" size={30} onPress={async () => await rejectAssociationRequest(companyAssociation.entityNpub)}/>
                        </>
                    }
                    {companyAssociation.status === EntityAssociationStatus.ACCEPTED &&
                        <FontAwesome name="trash" size={25} onPress={async () => await removeCompanyAssociation(companyAssociation.entityNpub)}/>
                    }
                </View>
            </Card.Actions>
        </Card>)))
}
