import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { NavigationProp } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { PressableOpacity } from 'react-native-pressable-opacity';
import Button from './Button';
import { StatusBarBlurBackground } from '../views/StatusBarBlurBackground';
import { RNCamera } from 'react-native-camera';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const RECT_WIDTH = SCREEN_WIDTH * 0.8; // 80% of screen width
const RECT_HEIGHT = SCREEN_HEIGHT * 0.18; // 18% of screen height
const RECT_TOP = (SCREEN_HEIGHT - RECT_HEIGHT) / 2;
const RECT_LEFT = (SCREEN_WIDTH - RECT_WIDTH) / 2;

export default function BarCodeScanner({ route }: any): React.ReactElement {

  const navigation = useNavigation<NavigationProp<any>>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(true);
  const formName = useRef<string | null>(null);
  const isShowingAlert = useRef(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!RNCamera) {
      console.warn('RNCamera module is not loaded properly');
    }
  }, []);

  const onBarCodeRead = useCallback(
    (event: any) => {
      const value = event.data;
      if (!value) return;

      // Only allow one scan at a time, but reset after a short delay for faster scanning
      if (isShowingAlert.current) return;
      isShowingAlert.current = true;

      setTimeout(() => {
        isShowingAlert.current = false;
      }, 500);
    },
    [navigation],
  );

  // Show a message for unsupported Android versions
  if (Platform.OS === 'android' && Platform.Version < 21) {
    return (
      <View style={styles.centered}>
        <Text>
          Camera is not supported on Android versions below 5.0 (API 21).
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>Camera permission denied</Text>
        <Button title="Try Again" onPress={() => setHasPermission(true)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hasPermission && (
        <RNCamera
          style={{ flex: 1 }}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          androidCameraPermissionOptions={{
            title: 'Camera Permission',
            message: 'App needs camera permission to scan barcodes',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }}
          onBarCodeRead={onBarCodeRead}
          rectOfInterest={{
            x: 0,
            y: 0,
            width: 1,
            height: 1,
          }}
          cameraViewDimensions={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
          }}
        />
      )}

      <StatusBarBlurBackground />

      <View
        style={[
          styles.overlay,
          {
            top: RECT_TOP,
            left: RECT_LEFT,
            width: RECT_WIDTH,
            height: RECT_HEIGHT,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.scanFrame} />
      </View>

      <View style={styles.rightButtonRow}>
        <PressableOpacity
          style={styles.button}
          onPress={() => setTorch(!torch)}
          disabledOpacity={0.4}
        >
          <IonIcon
            name={torch ? 'flash' : 'flash-off'}
            color="white"
            size={24}
          />
        </PressableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginBottom: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  overlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    flex: 1,
    borderColor: '#00FF00',
    borderWidth: 2,
    borderRadius: 8,
    width: '100%',
    height: '100%',
  },
});
