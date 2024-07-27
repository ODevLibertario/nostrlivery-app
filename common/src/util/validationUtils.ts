export class ValidationUtils {
    static regexLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/
    static regexLon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/

    static isValidLatitude(latitude: string) {
        return ValidationUtils.regexLat.test(latitude)
    }

    static isValidLongitude(longitude: string) {
        return ValidationUtils.regexLon.test(longitude)
    }

    static isEmpty(obj: any) {
        return Object.keys(obj).length === 0
    }
}