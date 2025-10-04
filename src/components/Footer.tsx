// import { SCREEN_WIDTH } from '../constant';
import {  View, StyleSheet, Image } from 'react-native';
import { getHeight, moderateScale } from '../common/constants';
import images from '../assets/images';
import { commonStyle } from '../theme';

const Footer = ({ isDark = false }) => {
  // Pick text color based on dark/light mode
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <View style={styles.container}>
      {/* <Text style={[styles.text, { color: textColor }]}>Power By : </Text>
      <View style={styles.logoWrapper}>
        {isDark ? <LogoWhiteFooter /> :
          <LogoFooter />}
      </View>
      <Text style={[styles.text, { color: textColor, marginLeft: 0 }]}>
        Company
      </Text> */}
      <Image
        source={!isDark ? images.footerImgLight : images.footerImgDark}
        style={styles.footerImage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: SCREEN_WIDTH,
    width: '100%',
    justifyContent: 'center',
    height: getHeight(90),
    alignItems: 'flex-end',
    flexDirection: 'row',
    transform: [{ scale: 1.07 }],
    ...commonStyle.mb15
  },
  text: {
    fontWeight: '600',
    height: moderateScale(40),
    marginLeft: moderateScale(10),
  },
  logoWrapper: {
    width: moderateScale(50),
    top: -20,
  },
  footerImage: {
    width: moderateScale(180),
    height: getHeight(90),
    resizeMode: 'contain',
  }
});

export default Footer;
