import React from "react";
import { View, StyleSheet } from "react-native";

interface OverlayProps {
  bgColorRGBA?: string,
  opacity?: string,
  mode?: string,
  children?: React.ReactNode,
  zIndex?: number
}

const Overlay = ({
  bgColorRGBA = 'rgba(0,0,0,0.2)',
  children,
  mode = 'light',
  zIndex = 1000,
}: OverlayProps) => {
  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        {
          zIndex,
          flex: 1, justifyContent: "center", backgroundColor: bgColorRGBA, padding: 20
        },
      ]}
    >
      {children}
    </View >
  );
};

export default Overlay;
