import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, Alert, Platform, Modal, ViewStyle } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { labelStyle } from '../styles/styles';
import { useTheme } from '../theme/ThemeProvider';
import AddIcon from "../assets/add.svg"
import CrossIcon from "../assets/cross.svg"
import { CropView } from "react-native-image-crop-tools"
import Button from './Button';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constant';
import { requestCamera, scaleSM, verticalScaleSM } from '../utility/helpers';
import RNFS from "react-native-fs"
import { Image as ImageCompressor, Video as VideoCompressor, createVideoThumbnail, clearCache } from 'react-native-compressor';

interface UploadPickerProps {
  width?: number
  height?: number,
  imageOrVideo?: "image" | "video"
  label?: string,
  onChangeText: (file: any) => void,
  value: any,
  readonly?: boolean,
  error?: string
  style?: ViewStyle
  caption?: string
  maxSize?: number
}

const UploadPicker = ({ width, height, imageOrVideo, label, onChangeText, value, readonly, error, style, caption, maxSize }: UploadPickerProps) => {
  const [media, setMedia] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const cropViewRef = useRef<CropView>(null)
  const { colors } = useTheme()

  const generateThumbnailForUpload = async (videoUri: string) => {
    const thumbnail = await createVideoThumbnail(videoUri);

    // Extract filename from path
    const fileName = `thumb_${Date.now()}.jpg`;

    // Optional: move from cache to files directory if you want persistent storage
    const newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    await RNFS.copyFile(thumbnail.path, newPath);

    return {
      uri: `file://${newPath}`, // RNFS gives absolute path without file://
      type: thumbnail.mime,
      fileName,
      path: newPath,
    };
  };

  // Image compression function
  const compressImage = async (imageUri: string, targetSizeBytes: number = 2.5 * 1024 * 1024) => {
    try {
      setIsCompressing(true);

      // Get initial file size
      const stats = await RNFS.stat(imageUri.replace('file://', ''));
      const initialSize = stats.size;

      if (initialSize <= targetSizeBytes) {
        setIsCompressing(false);
        return imageUri;
      }

      // Start with high quality and reduce if needed
      let quality = 0.9;
      let compressedUri = imageUri;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          compressedUri = await ImageCompressor.compress(imageUri, {
            compressionMethod: 'auto',
            quality: quality,
            maxWidth: 1920,
            maxHeight: 1920,
          });

          const compressedStats = await RNFS.stat(compressedUri.replace('file://', ''));
          const compressedSize = compressedStats.size;

          if (compressedSize <= targetSizeBytes) {
            setIsCompressing(false);
            return compressedUri;
          }

          quality -= 0.15;
          attempts++;
        } catch (compressionError) {
          console.error('ME52RETAILERTESTING', 'Compression attempt failed:', compressionError);
          quality -= 0.15;
          attempts++;
        }
      }
      setIsCompressing(false);
      return compressedUri;
    } catch (error) {
      console.error('ME52RETAILERTESTING', 'Image compression error:', error);
      setIsCompressing(false);
      return imageUri; // Return original if compression fails
    }
  };

  // Video compression function
  const compressVideo = async (videoUri: string, targetSizeBytes: number = 25 * 1024 * 1024) => {
    try {
      setIsCompressing(true);

      const thumbForUpload = await generateThumbnailForUpload(videoUri);
      console.log("Ready to upload:", thumbForUpload);

      // Get initial file size
      const stats = await RNFS.stat(videoUri.replace('file://', ''));
      const initialSize = stats.size;

      if (initialSize <= targetSizeBytes) {
        setIsCompressing(false);
        return videoUri;
      }

      const compressedUri = await VideoCompressor.compress(videoUri, {
        compressionMethod: 'manual',
        minimumFileSizeForCompress: maxSize,
        bitrate: 2000000, // 2 Mbps - good quality
      });

      const compressedStats = await RNFS.stat(compressedUri.replace('file://', ''));
      const compressedSize = compressedStats.size;

      setIsCompressing(false);

      if (compressedSize <= targetSizeBytes) {
        return compressedUri;
      } else {
        // You might want to try again with lower bitrate or show warning
        return compressedUri;
      }
    } catch (error) {
      console.error('ME52RETAILERTESTING', 'Video compression error:', error);
      setIsCompressing(false);
      return videoUri; // Return original if compression fails
    }
  };

  const handlePick = () => {
    Alert.alert(
      'Upload ' + (label ?? 'Media'),
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose from Gallery', onPress: pickFromGallery },
        imageOrVideo === "image" ?
          { text: 'Take Photo', onPress: pickPhotoFromCamera } :
          { text: 'Record Video', onPress: recordVideoFromCamera },
      ]
    );
  };

  const pickPhotoFromCamera = async () => {
    if (await requestCamera()) {
      launchCamera({
        mediaType: 'photo',
        quality: 1,
        cameraType: 'back',
        saveToPhotos: true,
      }).then(async (response: any) => {
        if (response?.assets?.[0]?.uri) {
          const asset = response.assets[0];
          // if (maxSize && asset.fileSize && asset.fileSize > maxSize) {
          //   Alert.alert('Error', `Image must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
          //   return;
          // }

          const sourceUri = asset.uri
          const filename = `photo_${Date.now()}.png`
          const destPath = `${RNFS.DocumentDirectoryPath}/${filename}`
          await RNFS.copyFile(sourceUri, destPath)

          // Compress image if over 1MB
          const compressedUri = await compressImage(`file://${destPath}`, maxSize);
          setMedia(compressedUri);
          setIsCropping(true);
        }
      }).catch(e => {
        if (e.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', e.message);
        }
      });
    }
  };

  const pickFromGallery = async () => {
    launchImageLibrary({
      mediaType: imageOrVideo === "image" ? 'photo' : "video",
      quality: 1
    })
      .then(async (response: any) => {
        const asset = response?.assets?.[0];
        if (!asset?.uri) return;
        if (imageOrVideo === "image") {
          // Compress image if over 2.5MB
          const compressedUri = await compressImage(asset.uri, maxSize);
          setMedia(compressedUri);
          setIsCropping(true);
        } else {
          // Compress video if over 25MB
          const compressedUri = await compressVideo(asset.uri, maxSize);

          const thumbForUpload = await generateThumbnailForUpload(compressedUri);
          // Create updated asset object with compressed URI
          const compressedAsset = {
            ...asset,
            uri: compressedUri,
            video_thumbnail: thumbForUpload
          };

          onChangeText(compressedAsset);
        }
      })
      .catch(e => {
        if (e.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', e.message);
        }
      });
  };

  const recordVideoFromCamera = async () => {
    if (await requestCamera()) {
      launchCamera(
        {
          mediaType: 'video',
          saveToPhotos: true,
          videoQuality: "high",
          cameraType: 'back',
          quality: 1,
        },
        async response => {
          if (response.didCancel) return;
          if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Failed to record video');
            return;
          }
          if (response?.assets?.[0]) {
            const asset = response?.assets[0];
            // Compress video if over 25MB
            const compressedUri = await compressVideo(asset.uri, maxSize);

            const thumbForUpload = await generateThumbnailForUpload(compressedUri);
            // Create updated asset object with compressed URI
            const compressedAsset = {
              ...asset,
              uri: compressedUri,
              video_thumbnail: thumbForUpload
            };

            onChangeText(compressedAsset);
          }
        }
      );
    }
  };

  const clearMedia = () => {
    onChangeText(null);
  };

  const cropImage = () => {
    cropViewRef.current?.saveImage(true, 90)
  };

  const onImageCrop = async (res: any) => {
    try {
      const croppedUri = res.uri;

      if (!croppedUri || !(await RNFS.exists(croppedUri))) {
        Alert.alert("Error", "Cropped image not found.");
        return;
      }

      const fileName = `cropped_${Date.now()}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.copyFile(croppedUri, destPath);

      // Compress the cropped image if over 2.5MB
      const compressedUri = await compressImage(`file://${destPath}`, maxSize);

      const file = {
        uri: compressedUri,
        fileName: fileName,
        type: 'image/jpeg',
        path: compressedUri.replace('file://', ''),
      };
      console.log('ME52RETAILERTESTING', "File object is here ", file)
      setIsCropping(false);
      onChangeText(file); // Will update preview
    } catch (err) {
      console.error("ME52RETAILERTESTING", "Crop error", err);
      Alert.alert("Crop Error", "Unable to process cropped image.");
      setIsCropping(false);
    }
  };

  // Show compression indicator
  if (isCompressing) {
    return (
      <View style={[style]}>
        {label && <Text style={[labelStyle, { color: colors.textDarker, flexWrap: 'wrap' }]}>{label}</Text>}
        <View style={[styles.container, { width: width, height: height, borderColor: colors.orange }]}>
          <View style={styles.compressionContainer}>
            <Text style={[styles.compressionText, { color: colors.orange }]}>
              Compressing {imageOrVideo === 'image' ? 'Image' : 'Video'}...
            </Text>
            <Text style={[styles.compressionSubText, { color: colors.textDarker }]}>
              Please wait
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[style]}>
      {label && <Text style={[labelStyle, { color: colors.textDarker, flexWrap: 'wrap' }]}>{label}</Text>}
      <View style={[styles.container, { width: width, height: height, borderColor: error ? colors.error : "#ccc" }]}>
        {value && !isCropping ? (
          <TouchableOpacity style={styles.previewWrapper} disabled={readonly} onPress={handlePick}>

            {(typeof value === "string" && value.indexOf(".mp4") !== -1) || (value?.type?.startsWith('video')) ? (
              <>
                <Video
                  source={{ uri: value.uri ?? value }}
                  style={styles.media}
                  resizeMode="cover"
                  controls
                  paused
                />

              </>
            ) : (
              <Image
                source={{ uri: value.uri ?? value }}
                style={styles.media}
              />
            )}
            {!readonly && (
              <TouchableOpacity style={styles.crossButton} onPress={clearMedia}>
                <CrossIcon />
              </TouchableOpacity>
            )}

          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={{ ...styles.plusContainer, width: '100%' }} disabled={readonly} onPress={handlePick}>
            {caption && <Text style={[{ color: colors.orange, fontSize: 12 }]}>{caption}</Text>}
            <AddIcon />
          </TouchableOpacity>
        )}
      </View>

      <Modal transparent visible={isCropping} animationType="slide">
        <View style={StyleSheet.absoluteFillObject}>
          <View style={styles.overlayContainer}>
            <CropView
              sourceUrl={media}
              ref={cropViewRef}
              onImageCrop={onImageCrop}
              // keepAspectRatio
              style={styles.cropView}
            />
            <View style={styles.overlayButton}>
              <Button title="Crop"
                style={{ backgroundColor: colors.orange }}
                fullWidth onPress={cropImage} />
            </View>
          </View>
        </View>
      </Modal>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  plusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  error: {
    marginTop: 2,
    fontSize: 13,
  },
  cropContainer: {
    flex: 1,
    width: SCREEN_WIDTH - scaleSM(50),
    height: SCREEN_HEIGHT - verticalScaleSM(100)
  },
  cropView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgb(75, 75, 75)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 1001,
  },
  compressionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  compressionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  compressionSubText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default React.memo(UploadPicker);