import {TextInput} from "react-native-paper"
import React from "react"
import {type Control, useController} from "react-hook-form"
import {type RegisterOptions} from "react-hook-form/dist/types/validator"

interface Props {
    label: string
    control: Control
    rules: RegisterOptions
}

export const FormTextInput = ({ label, control, rules }: Props) => {
    const controller = useController({name: label, control: control, rules: rules, defaultValue: undefined})
    return (
        <TextInput
            label={label}
            value={controller.field.value}
            onChangeText={controller.field.onChange}
        />
    )
}