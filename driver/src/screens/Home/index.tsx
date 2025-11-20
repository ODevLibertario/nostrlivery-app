import { useState, useEffect } from "react"
import { StorageService, StoredKey } from "@odevlibertario/nostrlivery-common"
import { Card, Button, Text } from "react-native-paper"
import { View, StyleSheet, ScrollView } from "react-native"

export const HomeScreen = ({ navigation }: any) => {
    const [profile, setProfile] = useState<any>({})
    const storageService = new StorageService()

    useEffect(() => {
        storageService.get(StoredKey.PROFILE).then((data: any) => {
            if (!data) {
                navigation.navigate('Login')
            }
            setProfile(data)
        })
    }, [])


    if (profile) {
        return (
            <ScrollView style={styles.container}>
                <Card style={{ margin: '2%', maxHeight: 140 }} onPress={() => navigation.navigate("Menu")}>
                    <Card.Cover source={require('@assets/menu-header.jpg')} style={{ maxHeight: 100 }} />
                    <Card.Title title="Menu" titleStyle={{ alignSelf: 'flex-end', fontWeight: 'bold' }} />
                </Card>


            </ScrollView>
        )
    }

    return <></>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
