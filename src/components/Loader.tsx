import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View, ViewStyle } from "react-native";
import { SCREEN_WIDTH } from "../constant";
import { getHeight, moderateScale } from "../common/constants";

const LOADER_CONTAINER: ViewStyle = {
  width: '100%',
  height: getHeight(50),
  justifyContent: "center",
  alignItems: "center"
}

const Loader = ({ center }: { center?: boolean }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const loaderContainer: any = {

  }
  if (center) {
    loaderContainer['flex'] = 1
  }
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000, // 1 second per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[center ? styles.loaderContainerCenter : styles.loaderContainer]}>
      <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
        <Image
          source={require("../assets/loader.png")}
          style={{ width: moderateScale(50), height: moderateScale(50) }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: LOADER_CONTAINER,
  loaderContainerCenter: {
    ...LOADER_CONTAINER,
    flex: 1
  }
})

export default Loader;
