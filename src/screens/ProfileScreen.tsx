import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Text from '../components/Text';
import InfoRow from '../components/InfoRow';
import { useTheme } from '../theme/ThemeProvider';
import Footer from '../components/Footer';
import { getProfile } from '../services/login';
import { onError } from '../utility/Toaster';
import { useAuth } from '../context/AuthContext';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import Loader from '../components/Loader';
import { getCountryNameAsync } from 'react-native-country-picker-modal/lib/CountryService';
import { getStateByCodeAndCountry } from 'country-state-city/lib/state';

export const ProfileScreen = () => {

    const { users } = useAuth();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await getProfile(users?.token);
            const countryName = await getCountryNameAsync(res?.country.toUpperCase());
            const stateName = getStateByCodeAndCountry(res?.state.toUpperCase(), res?.country.toUpperCase());
            setProfile({ ...res, countryName, stateName: stateName?.name || '' });
            setLoading(false);
        } catch (err: any) {
            console.log('PROFILE_ERROR', err);
            onError('Profile', 'Unable to load profile');
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    )

    return (
        <CRootContainer>
            <CHeader title='My Profile' style={commonStyle.ph25} />
            {loading ? (
                <View style={commonStyle.flexCenter}>
                    <View style={commonStyle.flexCenter}>
                        <Loader />
                    </View>
                    <Footer />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={commonStyle.ph20} >
                    <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                <Text style={styles.avatarText}>
                                    {profile?.name ? profile.name.charAt(0).toUpperCase() : '?'}
                                </Text>
                            </View>
                            <Text style={[styles.profileName, { color: colors.text }]}>{profile?.name || 'N/A'}</Text>
                            <Text style={[styles.profileType, { color: colors.textDarker }]}>{profile?.type || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoGroup}>
                            <InfoRow label="Email" value={profile?.email || 'N/A'} />
                            {profile?.phone && profile?.phone_country_code && <InfoRow label="Phone" value={`+${profile?.phone_country_code || ''} ${profile?.phone || ''}`} />}
                            {profile?.alternate_phone && profile?.alternate_phone_country_code && <InfoRow label="Alternate Phone" value={`+${profile?.alternate_phone_country_code || ''} ${profile?.alternate_phone || ''}`} />}
                        </View>
                        <View style={styles.infoGroup}>
                            <InfoRow label="Address" value={profile?.address || 'N/A'} />
                            <InfoRow label="City" value={profile?.city || 'N/A'} valueStyle={{
                                textTransform: 'capitalize'
                            }} />
                            <InfoRow label="State" value={profile?.stateName || 'N/A'} />
                            <InfoRow label="Country" value={profile?.countryName || 'N/A'} />
                            <InfoRow label="Pincode" value={profile?.pincode || 'N/A'} />
                        </View>
                        <View style={styles.infoGroup}>
                            <InfoRow label="GST" value={profile?.gst || 'N/A'} />
                            {/* <InfoRow label="Verified" value={profile?.verified ? '✅ Yes' : '❌ No'} /> */}
                            <InfoRow label="Blocked" value={profile?.is_blocked ? '🚫 Yes' : 'Allowed'} />
                        </View>
                    </View>
                    <Footer />
                </ScrollView>
            )}
        </CRootContainer>
    );
};

const styles = StyleSheet.create({
    profileCard: {
        width: '100%',
        borderRadius: moderateScale(20),
        shadowOffset: { width: 0, height: moderateScale(4) },
        shadowOpacity: 0.13,
        shadowRadius: moderateScale(10),
        elevation: 5,
        alignSelf: 'center',
        ...commonStyle.mv25,
        ...commonStyle.pt25,
        ...commonStyle.pb10,
        ...commonStyle.ph20,
    },
    avatarContainer: {
        alignItems: 'center',
        ...commonStyle.mb20
    },
    avatar: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        alignItems: 'center',
        justifyContent: 'center',
        ...commonStyle.mb10
    },
    avatarText: {
        fontSize: moderateScale(36),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
    },
    profileName: {
        fontSize: moderateScale(22),
        fontWeight: '700',
        marginBottom: 2,
        textTransform: 'capitalize'
    },
    profileType: {
        fontSize: moderateScale(14),
        fontWeight: '500',
        textTransform: 'capitalize'
    },
    infoGroup: {
        ...commonStyle.pv15,
        borderTopWidth: moderateScale(1),
        borderTopColor: '#eee',
        gap: moderateScale(10),
    },
    infoLabel: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        opacity: 0.7,
    },
    infoValue: {
        fontSize: moderateScale(15),
        fontWeight: '500',
        textAlign: 'right',
        maxWidth: '60%',
    },
});
