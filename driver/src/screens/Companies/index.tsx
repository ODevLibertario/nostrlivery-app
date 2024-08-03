import {useEffect, useState} from "react"

import {Card} from "react-native-paper"
import {Text, View} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import {CompanyAssociation, CompanyAssociationStatus} from "@model/CompanyAssociation";
import {DriverNodeService} from "@service/DriverNodeService";

export const CompaniesScreen = ({navigation}: any) => {
    const [companyAssociations, setCompanyAssociations] = useState<CompanyAssociation[]>([])

    const driverNodeService = new DriverNodeService()

    useEffect(() => {
        driverNodeService.getCompanyAssociations()
            .then(companyAssociations => setCompanyAssociations(companyAssociations))
            .catch(e => console.log(e))
    }, [])


    return (companyAssociations && companyAssociations.map(companyAssociation => (
        <Card style={{margin: '2%', maxHeight: 140}}>
            <Card.Title title="Company 1" titleStyle={{alignSelf: 'flex-start', fontWeight: 'bold'}}/>
            <Card.Content>
                <Text style={{textTransform: 'capitalize'}}>Status: {companyAssociation.status}</Text>
            </Card.Content>
            <Card.Actions>
                <View style={{flexDirection: 'row'}}>
                    {companyAssociation.status == CompanyAssociationStatus.PENDING &&
                        <>
                            <FontAwesome name="check" size={25}/>
							<FontAwesome name="times" size={25}/>
                        </>
                    }
                    {companyAssociation.status == CompanyAssociationStatus.ACCEPTED &&
                        <FontAwesome name="trash" size={25}/>
                    }
                </View>
            </Card.Actions>
        </Card>)))


}
