import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { moderateScale } from '../common/constants';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Card = ({ children, style }: CardProps) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: moderateScale(18),
    padding: moderateScale(24),
    margin: moderateScale(12),
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(12),
    elevation: 6,
  },
});
