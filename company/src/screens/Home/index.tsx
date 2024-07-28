import { useState } from "react"
import {StorageService, StoredKey} from "@odevlibertario/nostrlivery-common"
import { Card } from "react-native-paper"

export const HomeScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>({})
    const storageService = new StorageService()

    storageService.get(StoredKey.PROFILE).then((data: any) => {
        if (!data) {
            navigation.navigate('Login')
        }
        setProfile(data)
    })

    if (profile) {
        return (
            <Card style={{ margin: '2%', maxHeight: 140 }} onPress={() => navigation.navigate("Menu")}>
                <Card.Cover source={require('@assets/menu-header.jpg')} style={{ maxHeight: 100 }} />
                <Card.Title title="Menu" titleStyle={{ alignSelf: 'flex-end', fontWeight: 'bold' }} />
            </Card>
        )
    }

    return <></>
}
