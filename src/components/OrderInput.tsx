import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import Input from "./Input"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Card } from "./Card"
import React, { useState } from "react"
import { useTheme } from "../theme/ThemeProvider"
import CrossBox from "../assets/cross2.svg"
import CheckWithoutBorder from "../assets/check-svgrepo-com 1.svg"
import { Control, Controller } from "react-hook-form"

interface OrderInputI {
    label?: string,
    readonly?: boolean,
    value: string,
    price: number,
    discount: number,
    onChangeText: (value: string) => void
    features?: Array<Record<string, any>>,
    index?: number
    name?: string;
    control?: Control<any>;
    rules?: any
}

const OrderInput = ({ label, value, onChangeText, features, index, discount, price, readonly, name, rules, control }: OrderInputI) => {

    const [showFeature, setShowFeature] = useState(false)
    const { colors } = useTheme()
    // features = [{label: 'SIM Tracking', active: true}, {label: 'Marketing Notification', active: false}]

    return (
        <Card style={styles.card}>
            {
                (control && name) ?
                    (
                        <Controller
                            control={control}
                            name={name}
                            render={({ field: { value, onChange } }) => (
                                <View>
                                    <TouchableOpacity onPress={() => setShowFeature(!showFeature)} activeOpacity={1} style={[styles.header]}>
                                        <Text style={[{ color: colors.text }, styles.label]}>
                                            {index != undefined && index + 1}. {label}
                                        </Text>
                                        <Image source={showFeature ? require('../assets/caret-up.png') : require('../assets/caret-down.png')} style={[styles.headerIcon]} />
                                    </TouchableOpacity>
                                    <Input
                                        value={value}
                                        onChangeText={(e) => onChangeText(e)}
                                        placeholder={`Enter ${label}`}
                                        keyboardType="number"
                                        readonly={readonly}
                                    />
                                    {showFeature && <View style={[styles.featureContainer]}>
                                        <View style={[styles.horizontalLine]}></View>
                                        {
                                            price > 0 &&
                                            <View style={[styles.priceBox]}>
                                                <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Price:</Text>
                                                <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Rs. {price}/-</Text>
                                            </View>
                                        }
                                        {/* <View style={[styles.priceBox]}>
                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Discount:</Text>
                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>{discount}%</Text>
                        </View> */}
                                        <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Feature</Text>
                                        <View style={{ borderWidth: 0.5, borderRadius: 10, padding: 10, borderColor: "#E1E1E1" }}>
                                            {
                                                features?.map((feature) => {
                                                    return (
                                                        <View style={[styles.featureHeader]} key={feature.label}>
                                                            {/* <Icon name={feature.active ? "checkbox-marked" : "close"} size={30} color={feature.active ? colors.primary : colors.text} />  */}
                                                            {feature.active ? <View style={{ borderWidth: 0.8, borderRadius: 5, borderColor: "#F39314", height: 20, backgroundColor: "#F3931454" }}>
                                                                <CheckWithoutBorder />
                                                            </View> :
                                                                <CrossBox />}
                                                            <Text key={feature.label} style={[{ color: feature.active ? "#F39314" : "#8F999E" }, styles.featureText]}>
                                                                {feature.label}
                                                            </Text>

                                                        </View>
                                                    )
                                                })
                                            }
                                        </View>
                                    </View>}
                                </View>
                            )}
                        />
                    ) : (
                        <View>
                            <TouchableOpacity onPress={() => setShowFeature(!showFeature)} activeOpacity={1} style={[styles.header]}>
                                <Text style={[{ color: colors.text }, styles.label]}>
                                    {index != undefined && index + 1}. {label}
                                </Text>
                                <Image source={showFeature ? require('../assets/caret-up.png') : require('../assets/caret-down.png')} style={[styles.headerIcon]} />
                            </TouchableOpacity >
                            <Input
                                value={value}
                                onChangeText={(e) => onChangeText(e)}
                                placeholder={`Enter ${label}`}
                                keyboardType="number"
                                readonly={readonly}
                            />
                            {
                                showFeature && <View style={[styles.featureContainer]}>
                                    <View style={[styles.horizontalLine]}></View>
                                    {
                                        price > 0 &&
                                        <View style={[styles.priceBox]}>
                                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Price:</Text>
                                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Rs. {price}/-</Text>
                                        </View>
                                    }
                                    {/* <View style={[styles.priceBox]}>
                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Discount:</Text>
                            <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>{discount}%</Text>
                        </View> */}
                                    <Text style={{ color: colors.text, marginBottom: 10, fontSize: 14, marginTop: 10 }}>Feature</Text>
                                    <View style={{ borderWidth: 0.5, borderRadius: 10, padding: 10, borderColor: "#E1E1E1" }}>
                                        {
                                            features?.map((feature) => {
                                                return (
                                                    <View style={[styles.featureHeader]} key={feature.label}>
                                                        {/* <Icon name={feature.active ? "checkbox-marked" : "close"} size={30} color={feature.active ? colors.primary : colors.text} />  */}
                                                        {feature.active ? <View style={{ borderWidth: 0.8, borderRadius: 5, borderColor: "#F39314", height: 20, backgroundColor: "#F3931454" }}>
                                                            <CheckWithoutBorder />
                                                        </View> :
                                                            <CrossBox />}
                                                        <Text key={feature.label} style={[{ color: feature.active ? "#F39314" : "#8F999E" }, styles.featureText]}>
                                                            {feature.label}
                                                        </Text>

                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </View>
                            }
                        </View >
                    )
            }

        </Card >
    )
}

const styles = StyleSheet.create({
    card: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        overflow: 'hidden'
    },
    header: {
        flexDirection: "row",
        width: '100%',
        justifyContent: "space-between",
        marginBottom: 15
    },
    label: {
        fontSize: 16,
        fontWeight: 500,
        marginBottom: 5
    },
    featureHeader: {
        flexDirection: "row",
        marginBottom: 12
    },
    priceBox: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    featureText: {
        fontSize: 14,
        paddingLeft: 10,
        // marginTop: 5
    },
    featureContainer: {
        marginTop: 10
    },
    headerIcon: {
        marginTop: 10,
        marginRight: 10
    },
    horizontalLine: {
        width: 1000,
        position: 'absolute',
        left: "-10%",
        borderWidth: 0.2,
        borderColor: "#8F999E54"
    }
})

export default React.memo(OrderInput)