import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { NavigationProp, useNavigation } from '@react-navigation/native';
import NavigationBack from '../assets/navigation_back.svg';
import { moderateScale } from 'react-native-size-matters';
import { commonStyle } from '../theme';
import Text from './Text';


import type { ViewStyle } from 'react-native';

interface CHeaderProps {
    title?: string;
    RightContainer?: React.ReactNode;
    style?: ViewStyle;
}

export default function CHeader({ title, RightContainer, style }: CHeaderProps) {
    const navigation = useNavigation<NavigationProp<any>>();

    const onPressBack = () => navigation.goBack();

    return (
        <View style={[styles.mainContainer, style]} >
            <View style={styles.rowContainer}>
                <TouchableOpacity
                    onPress={onPressBack}
                    // activeOpacity={0.8}
                    style={{ marginRight: moderateScale(10), bottom: 0, marginVertical: moderateScale(10) }}
                >
                    <NavigationBack height={moderateScale(40)} width={moderateScale(40)} />
                </TouchableOpacity>
                {title && (
                    <Text style={{ fontSize: moderateScale(18), fontWeight: '500' }}>{title}</Text>
                )}
            </View>
            <View style={{ marginLeft: 'auto' }}>
                {RightContainer}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    rowContainer: {
        ...commonStyle.flexRow,
        ...commonStyle.itemsCenter,
    },
    mainContainer: {
        ...commonStyle.rowSpaceBetween,
        ...commonStyle.pv10,
    }
})