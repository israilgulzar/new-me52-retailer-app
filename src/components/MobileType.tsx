import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from './Card';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import LockIcon from '../assets/iphone_lock.svg';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';
interface FaqSupportCardProps {
  onAndroid: () => void;
  oniOS: () => void;
}

export const MobilType = ({ onAndroid, oniOS }: FaqSupportCardProps) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        {/* <View style={styles.iconRow}> */}
        {/* <Icon name="headset" size={36} color={colors.primary} style={styles.icon} /> */}
        <TouchableOpacity
          onPress={onAndroid}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Image
            source={require('../assets/android_icon.png')}
            style={{ width: moderateScale(32), height: moderateScale(32), resizeMode: 'contain' }}
          />
          <Text
            variant="body"
            style={[styles.actionText, { color: colors.darker }]}
          >
            Android
          </Text>
        </TouchableOpacity>
        {/* </View> */}
      </Card>
      <Card style={styles.card}>
        {/* <View style={styles.actionsRow}> */}
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>{'COMING \n Soon'}</Text>
        </View>
        {/* <View style={styles.verticalDivider} /> */}
        <Image
          source={require('../assets/ios_icon.png')}
          style={{ tintColor: '#000', width: moderateScale(32), height: moderateScale(32) }}
        />
        <TouchableOpacity
          onPress={oniOS}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Text
            variant="body"
            style={[styles.actionText, { color: colors.darker }]}
          >
            iPhone
          </Text>
        </TouchableOpacity>
        {/* <LockIcon/> */}
        <Image
          source={require('../assets/lock_iphone.png')}
          style={{
            position: 'absolute',
            right: '5%',
            top: '10%',
            width: moderateScale(28),
            height: moderateScale(28),
          }}
        />
        {/* </View> */}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...commonStyle.flex,
    ...commonStyle.rowSpaceBetween,
  },
  card: {
    width: '48%',
    margin: 0,
    ...commonStyle.mt10,
    ...commonStyle.p20,
    borderRadius: moderateScale(20),
    borderWidth: moderateScale(2),
    borderColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconRow: {
    ...commonStyle.itemsCenter,
    ...commonStyle.mb10,
  },
  icon: {
    ...commonStyle.mb2,
  },
  actionsRow: {
    width: '100%',
    ...commonStyle.mt2,
    ...commonStyle.rowSpaceBetween,
  },
  actionBtn: {
    ...commonStyle.flex,
    ...commonStyle.itemsCenter,
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
  ribbon: {
    position: 'absolute',
    top: '5%',
    left: '-25%',
    width: moderateScale(100),
    backgroundColor: '#F79633',
    ...commonStyle.pv5,
    paddingHorizontal: '20%',
    transform: [{ rotate: '-40deg' }],
    zIndex: 10,
    elevation: 10,
  },
  ribbonText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
