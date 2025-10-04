import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';
import Footer from './Footer';
import { SCREEN_HEIGHT } from '../constant';

const RippleCircle = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.5,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scale, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
};

const RippleSplash = () => {
  return (
    <View style={styles.wrapper}>
      {/* Center content */}
      <View style={styles.centerWrapper}>
        <View style={styles.center}>
          <RippleCircle delay={0} />
          <RippleCircle delay={300} />
          <RippleCircle delay={600} />
          <RippleCircle delay={900} />

          {/* Central logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/ME_SECURE_LOGO.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Footer at the bottom */}
      <Footer isDark={true} />
    </View>
  );
};

const CIRCLE_SIZE = 150;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#2D313A',
    justifyContent: 'space-between', // space between center & footer
    alignItems: 'center',
    height: SCREEN_HEIGHT,
    paddingVertical: 20,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center',
  },
  center: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#6C717A',
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    backgroundColor: '#6C717A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    width: 100,
    height: 100,
  },
});

export default RippleSplash;
