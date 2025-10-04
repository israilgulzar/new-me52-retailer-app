import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import { moderateScale } from '../common/constants';

interface InfoRowProps {
    label: string;
    value: string | number | React.ReactNode;
    style?: any;
    valueStyle?: any;
}

const InfoRow = ({ label, value, style, valueStyle }: InfoRowProps) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.infoRow, style]}>
            <Text style={[styles.infoLabel, { color: colors.textDarker }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }, valueStyle]} numberOfLines={2} ellipsizeMode="tail">{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: moderateScale(15),
        fontWeight: '600',
        opacity: 0.7,
        maxWidth: '38%',
    },
    infoValue: {
        fontSize: moderateScale(15),
        fontWeight: '500',
        textAlign: 'right',
        maxWidth: '60%',
    },
});

export default InfoRow;
