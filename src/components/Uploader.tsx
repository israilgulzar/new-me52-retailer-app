// components/ImageUploader.js
import { useTheme } from '../theme/ThemeProvider';
import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Button from './Button';
import { requestCamera } from '../utility/helpers';

interface UploaderProps {
  label?: string,
  value?: any,
  onChangeText?: (value: any) => void,
  error?: string,
  readonly?: boolean
}

const Uploader = ({ label, value, onChangeText, error, readonly }: UploaderProps) => {
  const { colors, theme } = useTheme()

  const handlePickImage = () => {
    Alert.alert('Select Image', 'Choose source', [
      {
        text: 'Camera',
        onPress: async () => {
          if (await requestCamera()) {
            launchCamera(
              { mediaType: 'photo', quality: 0.8 },
              (response) => handleImageResponse(response)
            );

          }
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          launchImageLibrary(
            { mediaType: 'photo', quality: 0.8 },
            (response) => handleImageResponse(response)
          );
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleImageResponse = (response: any) => {
    if (response.didCancel) return;
    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage);
      return;
    }
    const asset = response.assets?.[0];
    if (asset) {
      //   setImage(asset);
      onChangeText?.(asset as any)
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <Button title="Select Image" onPress={handlePickImage} variant="outline_darker" disabled={readonly} />

      {value && (
        <>
          <Image source={{ uri: value.uri ?? value }} style={styles.imagePreview} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 16,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default React.memo(Uploader);
