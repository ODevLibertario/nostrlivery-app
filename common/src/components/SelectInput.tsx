import {StyleSheet, Text, View} from "react-native"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import SelectDropdown from "react-native-select-dropdown"
import React from "react"

interface Props {
    data: Array<{ label: string, value: string }>
    emptyMessage: string
    callback: (value: string) => void
}

export const SelectInput = ({ data, emptyMessage, callback }: Props) => {
    return (
        <SelectDropdown data={data} onSelect={(selectedItem, index) => {
            callback(selectedItem.value)
        }} renderButton={(selectedItem, isOpened) => {
            return (
                <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.dropdownButtonTxtStyle}>
                        {(selectedItem?.label) || emptyMessage}
                    </Text>
                    <MaterialCommunityIcons name={isOpened ? 'chevron-up' : 'chevron-down'} size={20} />
                </View>
            )
        }} renderItem={(item, index, isSelected) => {
            return (
                <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
                    <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
                </View>
            )
        }}></SelectDropdown>
    )
}

const styles = StyleSheet.create({
    dropdownButtonStyle: {
        width: '100%',
        height: 50,
        backgroundColor: '#d5d5d5',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        backgroundColor: '#E9ECEF',
        borderRadius: 8,
    },
    dropdownItemStyle: {
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dropdownItemTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: '#151E26',
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
})