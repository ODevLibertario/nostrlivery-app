import {useNavigation} from '@react-navigation/native'
import {useState, useEffect} from 'react'

export class NavigationUtils {
    static useFocus = () => {
        const navigation = useNavigation()
        const [isFocused, setIsFocused] = useState(false)
        const [focusCount, setFocusCount] = useState(0)
        const isFirstTime = focusCount === 1

        useEffect(() => {
            const unsubscribeFocus = navigation.addListener('focus', () => {
                setIsFocused(true)
                setFocusCount(prev => prev + 1)
            })
            const unsubscribeBlur = navigation.addListener('blur', () => {
                setIsFocused(false)
            })

            return () => {
                unsubscribeFocus()
                unsubscribeBlur()
            }
        })

        return {isFocused, isFirstTime, focusCount, isNavigation: focusCount > 1 && isFocused}
    }
}

