import React, {useEffect} from "react"
import {View} from "react-native"
import {useForm} from "react-hook-form"
import Toast from "react-native-toast-message"
import {getPublicKey, nip19} from "nostr-tools"
import {
    StorageService,
    NostrService,
    NodeService,
    NavigationUtils,
    StoredKey,
    FormTextInput,
    ActionButton,
    ValidationUtils
} from "@odevlibertario/nostrlivery-common"

const storageService = new StorageService()
const nostrService = new NostrService()
const nodeService = new NodeService()

// TODO Create and apply a model for menuItem, today it's taking the form labels as object attributes which is ugly like 'IMAGE URL'should be imageUrl
// TODO extract the logic out of the tsx file
export const MenuItem = ({route, navigation}: any) => {
    const {isNavigation} = NavigationUtils.useFocus()

    function isUpdate() {
        return route?.params?.index !== undefined
    }

    useEffect(() => {
        // Is coming from navigation
        if (isNavigation && isUpdate()) {

            storageService.get(StoredKey.NSEC).then(nsec => {
                nodeService.queryEvent({
                    kinds: [30000],
                    authors: [getPublicKey(nip19.decode(nsec).data as Uint8Array)]
                }).then(menu => {
                    const menuItem = menu[route.params.index]

                    form.setValue("Name", menuItem["Name"])
                    form.setValue("Description", menuItem["Description"])
                    form.setValue("Price", menuItem["Price"])
                    form.setValue("Image URL", menuItem["Image URL"])
                    form.setValue("Categories", menuItem["Categories"])
                    storageService.set(StoredKey.MENU, menu).then()
                })
            })
        }
    })

    const form = useForm()

    const addItem = async (menuItem: any) => {
        const nsec = await storageService.get(StoredKey.NSEC)
        let menu = await nodeService.queryEvent({
            kinds: [30000],
            authors: [getPublicKey(nip19.decode(nsec).data as Uint8Array)]
        })

        let menuUpdateEvent
        if (ValidationUtils.isEmpty(menu)) {
            menu = [menuItem]
        } else {
            menu = menu.concat(menuItem)
        }

        try {
            menuUpdateEvent = nostrService.signNostrEvent(nsec, 30000, [["n", "menu"]], menu)
            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: menuUpdateEvent})
            await nodeService.postEvent(event)
            await storageService.set(StoredKey.MENU, menu)
            form.reset()
            Toast.show({
                type: "success",
                text1: "Item added",
            })
            navigation.navigate("Menu")

        } catch (e) {
            Toast.show({
                type: "error",
                text1: "Error:" + JSON.stringify(e),
            })
            console.log(e)
        }
    }

    const updateItem = async (menuItem: any) => {
        const nsec = await storageService.get(StoredKey.NSEC)
        const menu = await storageService.get(StoredKey.MENU)

        menu[route.params.index] = menuItem

        try {
            const menuUpdateEvent = nostrService.signNostrEvent(nsec, 30000, [["n", "menu"]], menu)
            const event = nostrService.signNostrliveryEvent(nsec, "PUBLISH_EVENT", {event: menuUpdateEvent})
            await nodeService.postEvent(event)
            await storageService.set(StoredKey.MENU, menu)
            form.reset()
            Toast.show({
                type: "success",
                text1: "Item updated",
            })
            navigation.navigate("Menu")

        } catch (e) {
            Toast.show({
                type: "error",
                text1: "Error:" + JSON.stringify(e),
            })
            console.log(e)
        }
    }

    const cancel = async () => {
        form.reset()
        navigation.navigate("Menu")
    }

    return <View style={{margin: '2%'}}>
        <FormTextInput
            label="Name"
            control={form.control}
            rules={{minLength: 1, required: true}}
        />
        <FormTextInput
            label="Description"
            control={form.control}
            rules={{minLength: 1, required: true}}
        />
        <FormTextInput
            label="Price"
            control={form.control}
            rules={{minLength: 1, required: true, pattern: /\d+(,\d{1,2})?/}}
        />
        {/* TODO allow image upload from gallery */}
        <FormTextInput
            label="Image URL"
            control={form.control}
            rules={{pattern: /\bhttps?:\/\/\S+?\.(?:png|jpe?g|gif|bmp)\b/}}
        />
        {/* TODO This needs to be a list input where the user presses enter and it adds to a list */}
        <FormTextInput
            label="Categories"
            control={form.control}
            rules={{minLength: 1, required: true, pattern: /(?:\s*\w+\s*(?:,\s*\w+\s*)*)?/}}
        />

        <ActionButton title={isUpdate() ? "Update" : "Save"} color={"purple"} onPress={isUpdate() ? form.handleSubmit(updateItem) : form.handleSubmit(addItem)} customStyle={{margin: '2%'}}/>
        <ActionButton title={"Cancel"} color={"red"} onPress={cancel} customStyle={{margin: '2%'}}/>
    </View>
}
