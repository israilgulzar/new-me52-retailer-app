import HeaderLeft from "../components/HeaderLeft"
import { OrderStackParamList } from "../navigation/AppNavigator"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { getOrderById } from "../services/orders"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { useAuth } from "../context/AuthContext"
import Loader from "../components/Loader"
import { Card } from "../components/Card"
import { useTheme } from "../theme/ThemeProvider"
import CaretUp from "../assets/caret-up.svg"
import CaretDown from "../assets/caret-down.svg"
import CrossBox from "../assets/cross2.svg"
import CheckWithoutBorder from "../assets/check-svgrepo-com 1.svg"
import OrangeCricle from "../assets/orange_cricle.svg"
import Footer from "../components/Footer"
import { dateToString } from "../utility/helpers"
import CHeader from "../components/CHeader"
import CRootContainer from "../components/CRootContainer"
import { commonStyle } from "../theme"
import { getHeight, moderateScale } from "../common/constants"

type STATUS = "LOADING" | "SUCCESS" | "ERROR" | "NO_DATA"

const ViewOrder = () => {

    const navigation = useNavigation()
    const route = useRoute<RouteProp<OrderStackParamList, 'ViewOrder'>>();
    const [status, setStatus] = useState<STATUS>("LOADING")
    const [orderDetails, setOrderDetails] = useState<Record<string, any>>({})
    const [showDetails, setShowDetails] = useState(false)
    const { users } = useAuth()
    const { colors } = useTheme()
    const orderId = route.params?.orderId
    const featureKey = ["image_notification", "location_tracking", "sim_tracking", "video_notification", "phone_block"]
    const featureKeyLabel = [{ key: "image_notification", label: "Image Notification" }, { key: "location_tracking", label: "Location Tracking" }, { key: "sim_tracking", label: "SIM Tracking" }, { key: "video_notification", label: "Video Notification" }, { key: "phone_block", label: "Phone Block" }]
    const fetchOrderDetails = useCallback(async (mounted: boolean, id: string) => {
        if (id && mounted) {
            try {

                setStatus("LOADING")
                const response = await getOrderById(id, users.token)
                console.log('ME52RETAILERTESTING', "Order response details ", response)
                const keys = response?.data?.keys;
                console.log('ME52RETAILERTESTING', keys)
                const keymap: any = {};
                let keyFeature: any = []
                keys?.forEach((key: any) => {
                    if (key?.keytype?._id)
                        keymap[key.keytype._id] = key.asked;
                    key.showDetails = false
                    for (let keyFeat in key.keytype) {
                        if (featureKey.includes(keyFeat)) {
                            const label = featureKeyLabel.find(featkeyLabel => featkeyLabel.key === keyFeat)?.label
                            keyFeature.push({
                                label: label,
                                active: key.keytype[keyFeat]
                            })
                        }
                    }
                    key.keyfeature = keyFeature
                    keyFeature = []
                });

                response.data.keys = keys
                setOrderDetails(response?.data)
                setStatus("SUCCESS")

            } catch (error) {
                console.log('ME52RETAILERTESTING', "Fetch key types error ", error)
                console.log('ME52RETAILERTESTING', error)
                setStatus("ERROR")
            }

        }
    }, [])

    useEffect(() => {
        let mounted = true
        if (orderId)
            fetchOrderDetails(mounted, orderId)

        return () => {
            mounted = false
        }
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Order Details',
            headerStyle: {
                backgroundColor: 'transparent',
                elevation: 0,
                shadowOpacity: 0,
                borderBottomWidth: 0
            },
            headerShadowVisible: false,
            headerLeft: () => <HeaderLeft navigation={navigation} />
        })
    }, [navigation])

    const handleKeytypeDetails = (key: any) => {
        setOrderDetails((prev) => {
            prev.keys = prev.keys.map((k: any) => {
                if (k._id === key._id) {
                    return { ...k, showDetails: !k.showDetails }
                }
                return { ...k }
            })

            return { ...prev }
        })
    }


    return (
        <CRootContainer>
            <CHeader title="Order Details" style={commonStyle.ph25} />
            {status === 'LOADING' &&
                <View style={commonStyle.flexCenter}>
                    <Loader />
                </View>}
            {status !== 'LOADING' && status === "SUCCESS" && <View>
                <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                    <Card style={{ elevation: 0, marginHorizontal: moderateScale(25) }}>
                        <View style={[styles.rowContainer]}>
                            <Text style={[{ color: colors.text, marginBottom: moderateScale(15) }, styles.rowKey]}>Order Id : </Text>
                            <Text style={[{ color: colors.text }, styles.rowValue]}>{orderDetails.orderId}</Text>
                        </View>
                        <View style={[styles.rowContainer]}>
                            <Text style={[{ color: colors.text, marginBottom: moderateScale(15) }, styles.rowKey]}>Order Type : </Text>
                            <Text style={[{ color: colors.text }, styles.rowValue]}>{orderDetails.type === "return" ? "Sale Return" : "Sale"}</Text>
                        </View>
                        <Text style={[{ color: colors.text, marginBottom: moderateScale(15) }, styles.rowKey]}>Status : </Text>
                        <View style={[styles.rowContainer]}>
                            <View>
                                <View style={{ overflow: 'hidden' }}>
                                    <View style={[styles.rowContainer, { marginBottom: moderateScale(10) }]}>
                                        <OrangeCricle style={{ marginTop: moderateScale(2) }} />
                                        <Text style={[{ color: colors.text }]}>&nbsp; Pending &nbsp; &nbsp; {dateToString(orderDetails?.createdAt, '-')}</Text>
                                        <Text style={[{ color: colors.text, }]}></Text>
                                    </View>
                                    {orderDetails && orderDetails?.status && orderDetails?.response_time &&
                                        <>
                                            {orderDetails?.status === 'fulfilled' ?
                                                <>
                                                    <View style={{ borderWidth: moderateScale(1), borderColor: "#DBD9D9", transform: [{ rotate: "90deg" }], position: 'relative', top: 7, width: 40, left: -12 }} ></View>
                                                    <View style={[styles.rowContainer, { marginVertical: moderateScale(10) }]}>
                                                        <OrangeCricle style={{ marginTop: moderateScale(2) }} />
                                                        <Text style={[{ color: colors.text }]}>&nbsp; Completed &nbsp; &nbsp; {dateToString(orderDetails?.response_time, '-')}</Text>
                                                    </View>
                                                </>
                                                :
                                                <>
                                                    <View style={{ borderWidth: moderateScale(1), borderColor: "#DBD9D9", transform: [{ rotate: "90deg" }], position: 'relative', top: 7, width: 40, left: -12 }} ></View>
                                                    <View style={[styles.rowContainer, { marginVertical: moderateScale(10) }]}>
                                                        <OrangeCricle style={{ marginTop: moderateScale(2) }} />
                                                        <Text style={[{ color: colors.text }]}>&nbsp; Rejected &nbsp; &nbsp; {dateToString(orderDetails?.response_time, '-')}</Text>
                                                    </View>
                                                </>
                                            }
                                        </>
                                    }
                                </View>
                            </View>
                        </View>
                        <View>
                            <Text style={[{ color: colors.text, borderBottomWidth: moderateScale(1), borderBottomColor: "#E1E1E1", paddingBottom: moderateScale(10), marginTop: moderateScale(20) }, styles.rowKey]}>Key Types Details</Text>
                        </View>
                        {
                            orderDetails.keys.map((key: any, index: number) => (
                                <View key={key._id}>
                                    <TouchableOpacity style={[styles.rowContainer, { justifyContent: 'space-between', borderBottomWidth: index !== orderDetails.keys.length - 1 ? moderateScale(1) : 0, borderBottomColor: index !== orderDetails.keys.length - 1 ? "#E1E1E1" : '', paddingVertical: moderateScale(10) }]} activeOpacity={0.8} onPress={() => handleKeytypeDetails(key)}>
                                        <Text style={[{ color: colors.text, width: "80%", paddingTop: moderateScale(5) }, styles.rowKey]} numberOfLines={1} ellipsizeMode="tail">{key.keytype.name}</Text>
                                        <Text style={[{ color: colors.text, width: "7%" }]}>{key.asked}</Text>
                                        <View style={[{ width: "8%", paddingTop: moderateScale(5) }]}>
                                            {key.showDetails ? <CaretUp width={moderateScale(15)} height={moderateScale(15)} /> : <CaretDown width={moderateScale(15)} height={moderateScale(15)} />}
                                        </View>
                                    </TouchableOpacity>
                                    {key.showDetails && (
                                        <View style={[styles.expandedDetails, { paddingHorizontal: moderateScale(30), paddingVertical: moderateScale(10), borderBottomWidth: index !== orderDetails.keys.length - 1 ? moderateScale(1) : 0, borderBottomColor: index !== orderDetails.keys.length - 1 ? "#E1E1E1" : '' }]}>
                                            {key?.keyfeature?.map((feature: any) => (
                                                <View style={[styles.featureHeader]} key={feature.label}>
                                                    {/* <Icon name={feature.active ? "checkbox-marked" : "close"} size={30} color={feature.active ? colors.primary : colors.text} />  */}
                                                    {feature.active ? (
                                                        <View style={{ borderWidth: moderateScale(0.8), borderRadius: moderateScale(5), borderColor: "#F39314", height: moderateScale(20), backgroundColor: "#F3931454" }}>
                                                            <CheckWithoutBorder />
                                                        </View>
                                                    ) : (
                                                        <CrossBox />
                                                    )}
                                                    <Text key={feature.label} style={[{ color: feature.active ? "#F39314" : "#8F999E" }, styles.featureText]}>
                                                        {feature.label}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            ))
                        }
                    </Card>
                    <Footer />
                </ScrollView>
            </View>}
        </CRootContainer>
    )
}

const styles = StyleSheet.create({
    rowContainer: {
        flexDirection: 'row'
    },
    rowKey: {
        fontSize: moderateScale(14),
        fontWeight: 500,
    },
    rowValue: {
        fontSize: moderateScale(14),
    },
    featureHeader: {
        flexDirection: "row",
        marginBottom: moderateScale(12)
    },
    featureText: {
        fontSize: moderateScale(14),
        paddingLeft: moderateScale(10),
    },
    scrollViewContent: {
        ...commonStyle.pv10,
        flexGrow: 1,
        minHeight: '100%',
    },
    expandedDetails: {
        flexShrink: 1,
        minHeight: getHeight(10),
    },
})

export default ViewOrder