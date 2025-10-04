import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from './Card';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import FAQIcon from '../assets/faq.svg';
import SupportIcon from '../assets/boy-services-support-icon 1.svg';
import { scaleSM, verticalScaleSM } from '../utility/helpers';
import { getHeight, moderateScale } from '../common/constants';
interface FaqSupportCardProps {
  onFaq: () => void;
  onSupport: () => void;
}

export const FaqSupportCard = ({ onFaq, onSupport }: FaqSupportCardProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      {/* <Card style={styles.card}> */}
      {/* <View style={styles.iconRow}> */}
      {/* <Icon name="headset" size={36} color={colors.primary} style={styles.icon} /> */}
      <TouchableOpacity
        onPress={onFaq}
        style={styles.actionBtn}
        activeOpacity={0.7}
      >
        {/* <Image source={require("../assets/FAQ_icon.png")} style={{width: 32, height: 32}}/> */}
        <FAQIcon width={moderateScale(40)} height={moderateScale(40)} />
        <Text
          variant="body"
          style={[styles.actionText, { color: colors.darker }]}
        >
          FAQ
        </Text>
      </TouchableOpacity>
      {/* </View> */}
      {/* </Card> */}
      {/* <Card style={styles.card}> */}
      {/* <View style={styles.actionsRow}> */}

      {/* <View style={styles.verticalDivider} /> */}
      {/* <Image source={require("../assets/support_icon.png")} style={{tintColor: "#000", width: 32, height: 32}}/> */}
      <TouchableOpacity
        onPress={onSupport}
        style={styles.actionBtn}
        activeOpacity={0.7}
      >
        <SupportIcon width={moderateScale(33)} height={moderateScale(33)} />
        <Text
          variant="body"
          style={[
            styles.actionText,
            {
              color: colors.darker,
              marginTop: moderateScale(5),
              zIndex: 100,
            },
          ]}
        >
          Support
        </Text>
      </TouchableOpacity>
      {/* </View> */}
      {/* </Card> */}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: moderateScale(8),
    marginBottom: moderateScale(12),
    flexDirection: 'row',
    width: '100%',
    // marginLeft: -10,
    // paddingHorizontal: 16,
  },
  card: {
    width: scaleSM(140),
    height: verticalScaleSM(70),
    // maxWidth: 420,
    // paddingVertical: verticalScaleSM(15),
    // marginRight: 20,
    padding: scaleSM(0),
    borderRadius: 20,
    shadowOpacity: 0.08,
    borderColor: '#000',
    borderWidth: 2,
    shadowRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    alignItems: 'center',
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginBottom: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 2,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    height: getHeight(80),
    borderRadius: moderateScale(15),
    borderWidth: moderateScale(2),
    borderColor: '#000',
    marginHorizontal: '2%',
    justifyContent: 'center',
  },
  actionText: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 8,
    alignSelf: 'center',
    backgroundColor: '#FFA000',
    opacity: 0.6,
  },
});
