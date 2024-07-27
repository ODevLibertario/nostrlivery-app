import React, {useEffect, useReducer, useState} from "react"
import {Alert, Image, TouchableOpacity, View} from "react-native"
import {StorageService, NodeService, NostrService, StoredKey} from "nostrlivery-common";
import {List} from "react-native-paper"
import {getPublicKey, nip19} from "nostr-tools"
import {NavigationUtils, ArrayUtils, ActionButton} from "nostrlivery-common";

export const MenuScreen = ({navigation}: any) => {
    const storageService = new StorageService()
    const nostrService = new NostrService()
    const nodeService = new NodeService()
    const [menu, setMenu] = useState<any>([])
    const {isNavigation} = NavigationUtils.useFocus()
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    const removeAlert = async (name: string, index: number) => {
        Alert.alert('Remove Item', 'Are you sure you want to remove the item ' + name + '?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {text: 'OK', onPress: () => remove(index)},
        ])
    }

    const remove = async (index: number) => {
        if (index > -1) {
            menu.splice(index, 1)
        }
        const nsec = await storageService.get(StoredKey.NSEC)
        const menuUpdateEvent = nostrService.signNostrEvent(nsec, 30000, [["n", "menu"]], menu)
        const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: menuUpdateEvent})
        await nodeService.postEvent(event)
        await storageService.set(StoredKey.MENU, menu)
        setMenu(menu)
        forceUpdate()
    }

    const edit = async (index: number) => {
        navigation.navigate("Menu Item", {index})
    }

    useEffect(() => {
        const nsec = storageService.get(StoredKey.NSEC).then(nsec => {
            nodeService.queryEvent({
                kinds: [30000],
                authors: [getPublicKey(nip19.decode(nsec).data as Uint8Array)]
            }).then(menu => {
                // TODO setting index here is bad, find a better way to set an id for the item
                menu.forEach((i: any, index: number) => i.index = index)
                setMenu(menu)
                storageService.set(StoredKey.MENU, menu).then()
            })
        })
    }, [])

    useEffect(() => {
        if (isNavigation) {
            storageService.get(StoredKey.MENU).then((menu) => {
                // TODO setting index here is bad, find a better way to set an id for the item
                menu.forEach((i: any, index: number) => i.index = index)
                setMenu(menu)
            })
        }
    })

    const categories = ArrayUtils.groupBy(menu, "Categories")

    return (
        <View style={{margin: '2%'}}>
            {menu && <List.Section>
                {Object.keys(categories).map((category: string) =>
                    <>
                        <List.Subheader>{category}</List.Subheader>
                        {categories[category].map((i: any) =>
                            <List.Item
                                key={i.index}
                                title={i["Name"] + " - " + i["Price"]} description={i["Description"]}
                                left={() => <Image style={{width: 60, height: 60}} source={{uri: i["Image URL"]}}></Image>}
                                right={() =>
                                    <>
                                        <TouchableOpacity style={{marginRight: '2%'}} onPress={() => edit(i.index)}>
                                            <List.Icon icon="pencil"/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeAlert(i["Name"], i.index)}>
                                            <List.Icon icon="delete"/>
                                        </TouchableOpacity>
                                    </>}
                            />
                        )}
                    </>
                )}
            </List.Section>}

            <ActionButton title={"Add Item"} color={"purple"} onPress={() => navigation.navigate("Menu Item")}/>
        </View>
    )
}
