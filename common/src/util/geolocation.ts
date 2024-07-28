import {PermissionsAndroid} from "react-native"
import * as Location from 'expo-location'

export class GeolocationUtils {
    static requestLocationPermission = async () => {
        Location.installWebGeolocationPolyfill()

        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

        return granted === 'granted'
    }

    static getLocation: () => Promise<GeolocationPosition | undefined> = async () => {
        const granted = await this.requestLocationPermission()

        if (granted) {
            return await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(position => {
                    resolve(position)
                },
                error => {
                    reject(error)
                })
            })
        }
    }
}
