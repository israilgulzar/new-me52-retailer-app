import { useTheme } from "../theme/ThemeProvider"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import Text from "./Text"
import TermsCheckbox from "../assets/terms_checkbox.svg"
import { boxShadow } from "../styles/styles"
import React from "react"
import { commonStyle } from "../theme"
interface CheckboxProps {
    value: boolean,
    label?: string,
    onChangeText: (value: boolean) => void,
    readonly?: boolean,
    terms?: boolean,
    border?: boolean
    error?: string
}

const Checkbox = ({ value, label, onChangeText, readonly, terms, border, error }: CheckboxProps) => {

    const { colors, theme } = useTheme()

    return (
        <>
            <View style={[border ? styles.termsRowBorder : styles.termsRow]}>
                <View style={[border ? boxShadow : '', { backgroundColor: border ? "#fff" : "", flexDirection: 'row', width: "100%", paddingVertical: 0, alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => onChangeText(!value)} style={styles.checkbox} activeOpacity={0.8} disabled={readonly}>
                        {!terms && <Icon name={value ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} color={colors.darker} />}
                        {terms && (value ? <TermsCheckbox /> : <Icon name={'checkbox-blank-outline'} size={22} color={colors.darker} />)}
                        <Text variant="body" style={{ marginLeft: 8 }}>{label}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </>
    )
}

const styles = StyleSheet.create({
    termsRow: {
        flexDirection: 'row',
        marginTop: '2%',
    },
    termsRowBorder: {
        flexDirection: 'row',
        marginTop: '2%',
        borderColor: "black",
        // borderRadius: 16,
        // paddingHorizontal: 12,
        height: 51,
        // alignItems: 'center'
    },
    checkbox: {
        paddingVertical: 4,
        flexDirection: 'row'
    },
    errorText: {
        marginTop: 2,
        ...commonStyle.mb20,
        fontSize: 13,
        lineHeight: 18,
    },
})

export default React.memo(Checkbox)