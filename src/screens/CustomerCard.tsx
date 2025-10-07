import { memo } from "react";
import { Image, View, Text, StyleSheet, } from "react-native";
import { useTheme } from "../theme/ThemeProvider"
import Button from "../components/Button"
import { Card } from "../components/Card"
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu"
import KebabMenu from "../assets/menu.svg"
import ShareI from "../assets/share.svg"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant"
import Uninstalled from "../assets/uninstall.svg"
import Qrcode from "../assets/qr-code-2.svg"
import { commonStyle } from "../theme";
import { moderateScale } from "../common/constants";

const CustomerCard = ({ item, handleOnSelectMenu, openDetailPage }:
    { item: any, handleOnSelectMenu: any, openModal: any, openDetailPage: any }) => {

    const { colors } = useTheme()

    return (
        <Card key={item.id} style={cardstyles.card}>
            <View style={[cardstyles.cardContainer]}>
                <View style={[cardstyles.contentContainer]}>
                    <View style={cardstyles.imageCard}>
                        <Image
                            style={cardstyles.image}
                            source={item.device && item.device.loan && item.device.loan.photo ? { uri: item.device.loan.photo } : require('../assets/image_placeholder.png')}
                            alt={item.name}
                            resizeMode="cover"
                        />
                        <Text style={cardstyles.active}>{item.is_blocked ? 'Blocked' : 'Active'}</Text>
                    </View>
                    <View style={cardstyles.personalCard}>
                        <View style={cardstyles.nameBlock}>
                            <Text style={[cardstyles.name, { color: colors.textDark }]}>{item.name}</Text>
                            <Menu onSelect={(value) => handleOnSelectMenu(value, item)}>
                                <MenuTrigger style={{ paddingHorizontal: 15 }}>
                                    <KebabMenu />
                                </MenuTrigger>
                                <MenuOptions customStyles={menuStyles}>
                                    <MenuOption value="share" style={{ overflow: 'hidden' }}>
                                        <View style={[styles.menuItem, { marginBottom: 10 }]}>
                                            <View style={{ width: 25, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <ShareI />
                                            </View>
                                            <Text style={{ color: colors.textDarker, marginLeft: 10 }}>Share</Text>
                                        </View>
                                        <View style={{ borderColor: '#F2F2F2', borderWidth: 1, width: '100%' }}></View>
                                    </MenuOption>
                                    <MenuOption value="uninstall">
                                        <View style={[styles.menuItem]}>
                                            <View style={{ width: 25, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Uninstalled />
                                            </View>
                                            <Text style={{ color: colors.textDarker, marginLeft: 10 }}>Uninstall</Text>
                                        </View>
                                        <View style={{ borderColor: '#F2F2F2', borderWidth: 1, width: '100%' }}></View>
                                    </MenuOption>
                                    <MenuOption value="qrcode">
                                        <View style={[styles.menuItem]}>
                                            <View style={{ width: 25, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Qrcode />
                                            </View>
                                            <Text style={{ color: colors.textDarker, marginLeft: 10 }}>QR Code</Text>
                                        </View>
                                    </MenuOption>
                                </MenuOptions>
                            </Menu>
                        </View>
                        <Text style={[{ color: colors.textLight }]}>{item.email}</Text>
                        <Text style={[{ color: colors.textLight }]}>{item.phone_country_code.indexOf("+") != -1 ? item.phone_country_code : `+${item.phone_country_code}`} <Text>{item.phone}</Text> / {item.alternate_phone_country_code.indexOf("+") != -1 ? item.alternate_phone_country_code : `+${item.alternate_phone_country_code}`} <Text>{item.alternate_phone}</Text></Text>
                        <Text style={[{ color: colors.textLight }]}>IMEI : {item.device.imei1}</Text>
                    </View>
                </View>
                {item?.loan_company_by && item?.loan_date && <View>
                    <Text style={[{ color: colors.textLight }]}>Loan By : {item.loan_company_by?.name || 'N/A'}</Text>
                    <Text style={[{ color: colors.textLight }]}>Loan Date : {item.loan_date ? item.loan_date.split(' - ')[0] : 'N/A'}</Text>
                </View>}
                <View style={[cardstyles.buttonContainer]}>
                    {/* <Button title={item.is_blocked ? "Unlock" : "Lock"} onPress={() => openModal("delete", item.is_blocked ? "unlock" : "lock", item)} variant={item.is_blocked ? "outline_orange" : "orange"} style={cardstyles.buttonOrange} icon={"lock"} left={true} smaller={true} /> */}
                    <Button title="Edit" onPress={() => openDetailPage(item)} variant="orange" style={cardstyles.button} smaller={true} />
                    {/* <Button title="Delete" onPress={() => openModal("delete", "delete", item)} variant="darker" style={cardstyles.button} smaller={true} /> */}
                </View>
            </View>
        </Card>
    );
};

const menuStyles = {
    optionsContainer: {
        //   padding: 5,
        borderRadius: 10,
        width: 150,
    },
};

const cardstyles = StyleSheet.create({
    loader: {
        alignItems: 'center',
        height: SCREEN_HEIGHT
    },
    loaderContainer: {
        // flex: 1,
        height: SCREEN_HEIGHT - 200,
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noData: {
        fontSize: 18,
        fontWeight: 600
    },
    card: {
        marginLeft: 0,
        marginRight: 0,
        ...commonStyle.mv10,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    imageCard: {
        width: '30%',
        padding: 5, // Add padding inside the card
        borderRadius: 18,
        backgroundColor: '#fff',
        shadowOpacity: 0.2,
        elevation: 4,
        shadowColor: '#000',
        alignItems: 'center', // Center contents inside
        marginBottom: 20,
        marginRight: 10,
    },
    image: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(10),
        backgroundColor: '#e5e5e5ff'
    },
    active: {
        fontSize: 12,
        fontWeight: '500',
        color: '#555',
        backgroundColor: '#eee',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
        overflow: 'hidden',
        textTransform: 'capitalize',
    },
    personalCard: {
        width: '70%',
        borderRadius: 18,
        padding: 5,
    },
    nameBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    shareIcon: {
    },
    name: {
        fontSize: 18,
        fontWeight: 500,
        paddingBottom: 5,
    },
    cardContainer: {
        // flexDirection: 'row',
        // justifyContent: "space-between"
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: "space-around"
    },
    button: {
        width: '100%',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 0,
        justifyContent: 'center',
        marginRight: 4
    },
    contentContainer: {
        flexDirection: "row"
    },
    buttonOrange: {
        width: 110,
        height: 38,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 0,
        justifyContent: 'center',
        marginRight: 4
    },
    filterContent: {
        width: "47%",
        height: 55,
        backgroundColor: "#fff",
        flexDirection: 'row',
        paddingLeft: 20,
        justifyContent: "space-between"
    },
    margin6: {
        marginRight: 6
    },
    filterRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
        alignItems: 'center'
    }
})

const styles = StyleSheet.create({
    loader: {
        alignItems: 'center',
        height: SCREEN_HEIGHT
    },
    loaderContainer: {
        // flex: 1,
        height: SCREEN_HEIGHT - 200,
        width: SCREEN_WIDTH,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noData: {
        fontSize: 18,
        fontWeight: 600
    },
    name: {
        fontSize: 18,
        fontWeight: 500,
        paddingBottom: 5,
    },
    filterContent: {
        width: "47%",
        height: 55,
        backgroundColor: "#fff",
        flexDirection: 'row',
        paddingLeft: 20,
        justifyContent: "space-between"
    },
    margin6: {
        marginRight: 6
    },
    filterRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
        alignItems: 'center'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    menuText: {
        marginLeft: 20,
        fontSize: 14,
        color: '#333',
    },
})

const areEqual = (prev: any, next: any) => prev.item._id === next.item._id;

export default memo(CustomerCard, areEqual);
