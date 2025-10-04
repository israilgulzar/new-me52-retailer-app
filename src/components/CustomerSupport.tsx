import React, { useEffect } from 'react';
import { View, StyleSheet, Linking, Alert, TouchableOpacity, FlatList } from 'react-native';
import Text from './Text';

import useSupport from '../hooks/useSupport';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

import Icon from 'react-native-vector-icons/FontAwesome';
import { getHeight, moderateScale } from '../common/constants';
import CRootContainer from './CRootContainer';
import CHeader from './CHeader';
import Loader from './Loader';
import { commonStyle } from '../theme';
import NoDataFound from './NoDataFound';

const CustomerSupport = ({ navigation }: any) => {

    const { users } = useAuth();
    const { fetchSupport, loadingStatus, supports } = useSupport({ users });

    useEffect(() => {
        fetchSupport(true);
    }, []);

    const openWhatsApp = (phone: string) => {
        const message = "Hello, I need help from ME52 support team.";
        const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url).catch(() => {
            Alert.alert("Make sure WhatsApp is installed");
        });
    };

    const onPressEmail = () => {
        Linking.openURL(`mailto:admin@me52company.com`).catch(() => {
            Alert.alert("Unable to open email client.");
        });
    }

    const openDialer = (phone: string) => {
        const phoneNumber = `tel:${phone.replace(/\D/g, '')}`;
        Linking.openURL(phoneNumber).catch(() => {
            Alert.alert("Unable to open dialer.");
        });
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <View key={index} style={styles.supportCard}>
            <Text variant="body" style={styles.phoneText}>+{item.phone_country_code} - {item.phone}</Text>
            <View style={styles.iconWrapper}>
                {
                    item.is_whatsapp_available && (
                        <TouchableOpacity style={styles.whatsappIcon} onPress={() => openWhatsApp(item.phone)}>
                            <Icon name="whatsapp" size={moderateScale(16)} color="#67C15E" />
                        </TouchableOpacity>
                    )
                }
                <TouchableOpacity style={styles.phoneIcon} onPress={() => openDialer(item.phone)}>
                    <Icon name="phone" size={moderateScale(16)} color="#F39314" />
                </TouchableOpacity>
            </View>
        </View>
    )

    const renderFooter = () => {
        return (
            <View >
                <Text
                    style={styles.forSaleTextStyle}
                >
                    {'For Sales'}
                </Text>
                <View style={styles.supportCard}>
                    <Text variant="body" style={styles.phoneText}>{'+91 98256 06691'}</Text>
                    <View style={styles.iconWrapper}>
                        <TouchableOpacity style={styles.whatsappIcon} onPress={() => openWhatsApp('+91 98256 06691')}>
                            <Icon name="whatsapp" size={moderateScale(16)} color="#67C15E" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.phoneIcon} onPress={() => openDialer('+91 98256 06691')}>
                            <Icon name="phone" size={moderateScale(16)} color="#F39314" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={onPressEmail} style={styles.supportCard}>
                    <Text variant="body" style={styles.phoneText}>{'admin@me52company.com'}</Text>
                </TouchableOpacity>
            </View>
        )
    }


    return (
        <CRootContainer style={styles.container}>
            <CHeader title='Customer Support' style={commonStyle.ph25} />
            {loadingStatus && <Loader center />}
            {!loadingStatus && (
                <FlatList
                    data={supports}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id.toString()}
                    ListEmptyComponent={<NoDataFound label='No support contacts available' />}
                    contentContainerStyle={styles.scrollContent}
                    ListFooterComponent={renderFooter}
                />
            )}


            {/* <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeading}>For Sales</Text>

                {contacts2.map((item, index) => (
                    <View key={index} style={styles.supportCard}>
                        <Text variant="body" style={styles.phoneText}>{item.phone}</Text>
                        <View style={styles.iconWrapper}>
                            <View style={styles.whatsappIcon}>
                                <TouchableOpacity style={styles.whatsappIcon} onPress={() => openWhatsApp(item.phone)}>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.phoneIcon}>
                                <TouchableOpacity style={styles.phoneIcon} onPress={() => openDialer(item.phone)}>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
                }
                <TextInput
                    style={styles.emailInput}
                    value={email}
                    editable={false}
                />

                <View style={{ height: 100 }} />
            </ScrollView > */}

            <Footer />

        </CRootContainer >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#F9F8F6',

    },
    supportCard: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(14),
        height: getHeight(55),
        ...commonStyle.mh25,
        ...commonStyle.ph15,
        marginBottom: moderateScale(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
    },
    phoneText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    iconWrapper: {
        flexDirection: 'row',
        gap: moderateScale(12),
    },
    whatsappIcon: {
        backgroundColor: '#67C15E33',
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneIcon: {
        backgroundColor: '#F3931433',
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 10,
        color: '#333',
    },
    emailInput: {
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    scrollContent: {
        ...commonStyle.pt10,
        ...commonStyle.flexGrow1,
    },
    forSaleTextStyle: {
        fontSize: moderateScale(16),
        fontWeight: '500',
        color: '#F39314',
        ...commonStyle.mv10,
        ...commonStyle.mh25,
    },
});

export default CustomerSupport;
