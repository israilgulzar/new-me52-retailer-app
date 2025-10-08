import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { borderRadius, boxShadow } from "../styles/styles";
import React, { useState, useRef, useEffect } from "react";
import { IMEIScanner } from "./IMEIScanner";
import Button from './Button';
import { getHeight, moderateScale } from "../common/constants";
import { commonStyle } from "../theme";
import { Control, Controller } from "react-hook-form";

interface BarcodeInputProps {
  value: string;
  label?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: ViewStyle;
  readonly?: boolean;
  secureTextEntry?: boolean;
  name?: string;
  iconReadonly?: boolean;
  maxLength?: number;
  control?: Control<any>;
  rules?: any
}

interface RootDrawerParamList {
  Barcode: { params: { key: string }, screen: any };
}

function BarcodeInput({
  value,
  label,
  onChangeText,
  readonly,
  error,
  secureTextEntry,
  style,
  placeholder,
  name,
  iconReadonly,
  maxLength = 15,
  rules,
  control,
}: BarcodeInputProps) {
  const { colors, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  const handleTextChange = (text: string) => {
    // Remove non-numeric characters and limit length
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= maxLength) {
      onChangeText(numericText);
    }
  };

  const openScanner = () => {
    if (iconReadonly || readonly) return;

    setModalVisible(true);
    setIsScanning(true);

    // Animate modal entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeScanner = () => {
    // Animate modal exit
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setIsScanning(false);
    });
  };

  const handleScanSuccess = (scannedImei: string) => {
    onChangeText(scannedImei);
    closeScanner();
  };

  // Reset animations when modal opens
  useEffect(() => {
    if (modalVisible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.3);
    }
  }, [modalVisible]);

  const isDisabled = readonly || iconReadonly;

  return (control && name) ?
    (
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange } }) => {
          const handleTextChange = (text: string) => {
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText.length <= maxLength) {
              onChange(numericText);
            }
          };

          const handleScanSuccess = (scannedImei: string) => {
            onChange(scannedImei);
            closeScanner();
          };

          return (
            <View style={{ ...style, height: getHeight(51) }}>
              {label && (
                <Text style={[styles.label, { color: colors.text }]}>
                  {label}
                </Text>
              )}

              <View style={styles.barcodeContainer}>
                <TextInput
                  value={value}
                  readOnly={readonly}
                  onChangeText={handleTextChange}
                  placeholder={placeholder || `Enter ${maxLength}-digit IMEI`}
                  placeholderTextColor={
                    theme === 'dark' ? '#BDBDBD' : colors.textDarker
                  }
                  secureTextEntry={secureTextEntry}
                  keyboardType="number-pad"
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                      color: colors.text,
                      borderColor: error && colors.error,
                      borderWidth: error ? 1 : 0,
                    },
                    boxShadow,
                    borderRadius,
                  ]}
                />

                <TouchableOpacity
                  style={styles.scanButton}
                  activeOpacity={isDisabled ? 1 : 0.7}
                  onPress={openScanner}
                  disabled={isDisabled}
                >
                  <Icon
                    name="barcode"
                    size={moderateScale(36)}
                    color={colors.border}
                  />
                </TouchableOpacity>
              </View>

              {error && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              )}

              {/* Modal Scanner */}
              <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={closeScanner}
                transparent={false}
                statusBarTranslucent
              >
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <View style={styles.modalContainer}>
                  <SafeAreaView style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={closeScanner}
                        activeOpacity={0.7}
                      >
                        <Icon name="close" size={28} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>IMEI Scanner</Text>
                      <View style={styles.placeholder} />
                    </View>

                    {/* Scanner */}
                    <View style={styles.scannerContainer}>
                      {isScanning && (
                        <IMEIScanner
                          ref={scannerRef}
                          onSuccessScanned={handleScanSuccess}
                        />
                      )}
                    </View>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                      <View style={styles.instructionBox}>
                        <Icon name="information" size={20} color="#FFF" />
                        <Text style={styles.instructionText}>
                          Point your camera at the IMEI barcode and hold steady
                        </Text>
                      </View>

                      <Button
                        title="Cancel"
                        variant="darker"
                        onPress={closeScanner}
                        style={styles.cancelButton}
                      />
                    </View>
                  </SafeAreaView>
                </View>
              </Modal>
            </View>
          );
        }}
      />
    ) :
    (
      <View style={{ ...style, height: getHeight(51) }}>
        {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
        <View style={[styles.barcodeContainer]}>
          <TextInput
            value={value}
            readOnly={readonly}
            onChangeText={handleTextChange}
            placeholder={placeholder || `Enter ${maxLength}-digit IMEI`}
            placeholderTextColor={theme === 'dark' ? '#BDBDBD' : colors.textDarker}
            secureTextEntry={secureTextEntry}
            keyboardType="number-pad"
            style={[
              styles.textInput,
              {
                backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                color: colors.text,
                borderColor: error && colors.error,
                borderWidth: error ? 1 : 0
                // shadowColor: theme === 'dark' ? colors.primary : undefined,
              }, boxShadow, borderRadius
            ]}
          />

          <TouchableOpacity
            style={
              styles.scanButton
            }
            activeOpacity={isDisabled ? 1 : 0.7}
            onPress={openScanner}
            disabled={isDisabled}
          >
            <Icon
              name="barcode"
              size={moderateScale(36)}
              color={colors.border}
            />
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}

        {/* Enhanced Modal with Scanner */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeScanner}
          transparent={false}
          statusBarTranslucent
        >
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <View
            style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeScanner}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>IMEI Scanner</Text>
                <View style={styles.placeholder} />
              </View>

              {/* Scanner */}
              <View style={styles.scannerContainer}>
                {isScanning && (
                  <IMEIScanner
                    ref={scannerRef}
                    onSuccessScanned={handleScanSuccess}
                  />
                )}
              </View>

              {/* Footer with instructions */}
              <View style={styles.modalFooter}>
                <View style={styles.instructionBox}>
                  <Icon name="information" size={20} color="#FFF" />
                  <Text style={styles.instructionText}>
                    Point your camera at the IMEI barcode and hold steady
                  </Text>
                </View>

                <Button
                  title='Cancel'
                  variant='darker'
                  onPress={closeScanner}
                  style={styles.cancelButton}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </View>
    );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 20,
  },
  counter: {
    fontSize: 12,
    fontWeight: '400',
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 8,
  },
  textInput: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    fontSize: 16,
    marginBottom: 2,
    width: "100%"
  },
  scanButton: {
    position: 'absolute',
    right: moderateScale(8),
    top: '50%',
    transform: [{ translateY: -20 }],
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 2,
    ...commonStyle.mb20,
    fontSize: 13,
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    ...commonStyle.pt10,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    ...commonStyle.rowSpaceBetween,
    ...commonStyle.ph15,
    ...commonStyle.pt20,
    ...commonStyle.pb10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderBottomWidth: moderateScale(1),
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    ...commonStyle.center,
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  barcodeContainer: {
    flexDirection: 'row',
    height: moderateScale(51),
    width: '100%',
    position: 'relative',
  },
  placeholder: {
    width: moderateScale(44),
  },
  scannerContainer: {
    flex: 1,
  },
  modalFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    ...commonStyle.ph20,
    ...commonStyle.pv15,
    borderTopWidth: moderateScale(1),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...commonStyle.p10,
    ...commonStyle.mb15,
    borderRadius: moderateScale(8),
  },
  instructionText: {
    color: '#FFF',
    ...commonStyle.ml10,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
});

export default React.memo(BarcodeInput);