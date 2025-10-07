import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, ListRenderItem } from 'react-native';
import useKeys, { KeyItem } from '../hooks/useKeys';
import { capitalizeName } from '../utility/helpers';
import CrossBox from '../assets/cross2.svg';
import CheckWithoutBorder from '../assets/check-svgrepo-com 1.svg';
import { useTheme } from '../theme/ThemeProvider';
import { commonStyle } from '../theme';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import NoDataFound from '../components/NoDataFound';
import { moderateScale } from '../common/constants';

const featureKeyLabel = [
    { key: "image_notification", label: "Image Notification" },
    { key: "location_tracking", label: "Location Tracking" },
    { key: "sim_tracking", label: "SIM Tracking" },
    { key: "video_notification", label: "Video Notification" },
    { key: "phone_block", label: "Phone Block" }
];

const ListKeys: React.FC = () => {
    const { keys, loading, error } = useKeys();
    const { colors } = useTheme();

    if (loading) {
        return (
            <View style={styles.loader}>
                <Loader />
                {/* <Text style={styles.loadingText}>Loading keys...</Text> */}
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    const renderItem: ListRenderItem<KeyItem> = ({ item }: any) => {
        const { name, price, discount, tax } = item.keytype;

        return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
                {/* Key Name */}
                <Text style={[styles.keyTitle, { color: colors.text }]}>{capitalizeName(name)}</Text>

                {/* Two Column Details */}
                <View style={styles.detailsRow}>
                    <View style={styles.detailBox}>
                        <Text style={[styles.detailLabel, { color: colors.textDark }]}>Available</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{item.count || 'N/A'}</Text>
                    </View>
                    {/* <View style={styles.detailBox}>
                        <Text style={[styles.detailLabel, { color: colors.textDark }]}>Price</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>₹{price || 'N/A'}</Text>
                    </View> */}
                </View>
                {/* <View style={styles.detailsRow}>
                    <View style={styles.detailBox}>
                        <Text style={[styles.detailLabel, { color: colors.textDark }]}>Discount</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{discount || 0}%</Text>
                    </View>
                    <View style={styles.detailBox}>
                        <Text style={[styles.detailLabel, { color: colors.textDark }]}>Tax</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{tax}%</Text>
                    </View>
                </View> */}

                {/* Feature Title */}
                <Text style={[styles.featureTitle, { color: colors.textLight }]}>Features</Text>

                {/* Features */}
                <View>
                    {featureKeyLabel.map((feat) => {
                        const active: any = item?.keytype[feat.key];
                        return (
                            <View style={styles.featureHeader} key={feat.key}>
                                {active ? (
                                    <View style={styles.activeBox}>
                                        <CheckWithoutBorder width={18} height={18} />
                                    </View>
                                ) : (
                                    <CrossBox width={18} height={18} />
                                )}
                                <Text style={[
                                    styles.featureText,
                                    { color: active ? "#F39314" : "#8F999E" }
                                ]}>
                                    {feat.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <CRootContainer>
            <CHeader title="Stock" style={commonStyle.ph25} />
            <FlatList
                data={keys}
                keyExtractor={(item, index) => `${item._id}-${index}`}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListFooterComponent={<Footer />}
                ListEmptyComponent={<NoDataFound label='No keys found' />}
                showsVerticalScrollIndicator={false}
            />
        </CRootContainer>
    );
};

export default ListKeys;

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        ...commonStyle.pv20,
        ...commonStyle.center,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    },
    errorBox: {
        ...commonStyle.p15,
        ...commonStyle.m15,
        backgroundColor: '#ffebeb',
        borderRadius: moderateScale(8),
    },
    errorText: {
        color: '#b00020',
        fontSize: 16,
    },
    list: {
        ...commonStyle.ph25
    },
    card: {
        borderRadius: moderateScale(14),
        ...commonStyle.p15,
        ...commonStyle.mb15,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: .2,
    },
    keyTitle: {
        fontSize: 18,
        fontWeight: '700',
        ...commonStyle.mb10,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...commonStyle.mb5,
    },
    detailBox: {
        flex: 1,
        width: '100%',
        backgroundColor: '#ebebebff',
        ...commonStyle.p10,
        borderRadius: moderateScale(8),
    },
    detailLabel: {
        fontSize: 13,
        ...commonStyle.mb2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        ...commonStyle.mb10,
        ...commonStyle.mt15,
    },
    featureHeader: {
        flexDirection: "row",
        alignItems: "center",
        ...commonStyle.mb10,
        ...commonStyle.ml5,
    },
    featureText: {
        fontSize: 14,
        ...commonStyle.pl10
    },
    activeBox: {
        borderWidth: 0.8,
        borderRadius: moderateScale(5),
        borderColor: "#F39314",
        height: moderateScale(18),
        width: moderateScale(18),
        backgroundColor: "#F3931454",
        justifyContent: "center",
        alignItems: "center",
    }
});
