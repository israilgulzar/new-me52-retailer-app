import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { requestCameraPermission } from '../utility/cameraPermissions';
import {
    ToastAndroid,
    StyleSheet,
    Text,
    View,
    Platform,
    Dimensions,
    Alert,
    TouchableOpacity,
    StatusBar,
    Animated,
    Vibration
} from "react-native";
// import QRCodeScanner from "react-native-qrcode-scanner";
// import { RNCamera } from "react-native-camera";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getHeight, moderateScale } from "../common/constants";
import { commonStyle } from "../theme";
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const RECT_WIDTH = SCREEN_WIDTH * 0.85;
const RECT_HEIGHT = SCREEN_HEIGHT * 0.2;
const RECT_TOP = (SCREEN_HEIGHT - RECT_HEIGHT) / 2.5;
const RECT_LEFT = (SCREEN_WIDTH - RECT_WIDTH) / 2;

interface IMEIScannerProps {
    onSuccessScanned: (imei: string) => void;
}

interface IMEIScannerRef {
    reset: () => void;
}

const IMEIScanner = forwardRef<IMEIScannerRef, IMEIScannerProps>(
    ({ onSuccessScanned }, ref) => {
        const isScanning = useRef(false);
        // const scanRef = useRef(null);
        const reactivateTimerRef = useRef<NodeJS.Timeout | null>(null);
        const [torchOn, setTorchOn] = useState(false);
        const [isActive, setIsActive] = useState(true);
        const animatedValue = useRef(new Animated.Value(0)).current;
        const [scanCount, setScanCount] = useState(0);
        const [lastScannedData, setLastScannedData] = useState<string>("");
        const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
        const device = useCameraDevice('back');

        // Vision Camera code scanner for QR and EAN-13 (IMEI)
        const codeScanner = useCodeScanner({
            codeTypes: ['code-128', 'code-39'],
            onCodeScanned: (codes) => {
                if (!isActive) return;
                if (codes.length > 0) {
                    const scannedData = codes[0]?.value?.trim();
                    if (scannedData && scannedData !== lastScannedData) {
                        setScanCount(prev => prev + 1);
                        setLastScannedData(scannedData);
                        const validImei = extractAndValidateIMEI(scannedData);
                        if (validImei) {
                            isScanning.current = true;
                            setIsActive(false);
                            if (Platform.OS === 'ios') {
                                Vibration.vibrate(100);
                            } else {
                                Vibration.vibrate([0, 100]);
                            }
                            if (Platform.OS === 'android') {
                                ToastAndroid.showWithGravity(
                                    'IMEI scanned successfully!',
                                    ToastAndroid.SHORT,
                                    ToastAndroid.CENTER,
                                );
                            }
                            onSuccessScanned(validImei);
                        } else {
                            showErrorMessage(`Invalid IMEI format. Please try again. (Attempt: ${scanCount})`);
                        }
                    }
                }
            }
        });


        // Camera permission check on mount
        useEffect(() => {
            let isMounted = true;
            (async () => {
                const granted = await requestCameraPermission();
                if (isMounted) {
                    setCameraPermission(granted ? 'granted' : 'denied');
                }
            })();
            return () => { isMounted = false; };
        }, []);

        // Animated scanning line
        useEffect(() => {
            const startAnimation = () => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(animatedValue, {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: false,
                        }),
                        Animated.timing(animatedValue, {
                            toValue: 0,
                            duration: 2000,
                            useNativeDriver: false,
                        }),
                    ])
                ).start();
            };

            if (isActive) {
                startAnimation();
            }

            return () => {
                animatedValue.setValue(0);
            };
        }, [isActive, animatedValue]);

        useFocusEffect(
            useCallback(() => {
                setIsActive(true);
                isScanning.current = false;
                setScanCount(0);
                setLastScannedData("");

                // Reset scanner

                return () => {
                    setIsActive(false);
                    if (reactivateTimerRef.current) {
                        clearTimeout(reactivateTimerRef.current);
                        reactivateTimerRef.current = null;
                    }
                };
            }, [])
        );

        useImperativeHandle(ref, () => ({
            reset: () => {
                isScanning.current = false;
                setIsActive(true);
                setScanCount(0);
                setLastScannedData("");

                if (reactivateTimerRef.current) {
                    clearTimeout(reactivateTimerRef.current);
                    reactivateTimerRef.current = null;
                }

            }
        }), []);

        // Enhanced Luhn algorithm check
        const luhnCheck = (digits: string): boolean => {
            if (!digits || digits.length !== 15) return false;

            let sum = 0;
            let shouldDouble = false;

            // Process digits from right to left
            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits.charAt(i), 10);

                if (shouldDouble) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }

                sum += digit;
                shouldDouble = !shouldDouble;
            }

            return sum % 10 === 0;
        };

        // Enhanced IMEI validation
        const extractAndValidateIMEI = (raw: string | undefined): string | null => {
            if (!raw) return null;

            // Only allow exactly 15 consecutive digits, no spaces or separators
            const match = raw.match(/\b\d{15}\b/);
            if (!match) return null;
            const digitsOnly = match[0];

            // Check for obviously invalid patterns (all same digits, sequential numbers)
            if (/^(.)\1{14}$/.test(digitsOnly)) return null; // All same digits
            if (digitsOnly === "123456789012345" || digitsOnly === "000000000000000") return null;

            // Validate using Luhn algorithm
            if (!luhnCheck(digitsOnly)) return null;

            return digitsOnly;
        };

        const showErrorMessage = (message: string) => {
            if (Platform.OS === 'android') {
                ToastAndroid.showWithGravity(
                    message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            } else {
                Alert.alert('Scan Error', message);
            }
        };

        const onScanSuccess = useCallback((event: any) => {
            if (isScanning.current || !isActive) return;

            const scannedData = event?.data?.trim();

            // Avoid processing the same data multiple times
            if (scannedData === lastScannedData) return;

            setScanCount(prev => prev + 1);
            setLastScannedData(scannedData);

            const validImei = extractAndValidateIMEI(scannedData);

            if (validImei) {
                isScanning.current = true;
                setIsActive(false);

                // Provide haptic feedback
                if (Platform.OS === 'ios') {
                    Vibration.vibrate(100);
                } else {
                    Vibration.vibrate([0, 100]);
                }

                // Success feedback
                if (Platform.OS === 'android') {
                    ToastAndroid.showWithGravity(
                        'IMEI scanned successfully!',
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER,
                    );
                }

                onSuccessScanned(validImei);
            } else {
                showErrorMessage(`Invalid IMEI format. Please try again. (Attempt: ${scanCount})`);

                // Quick reactivation for better UX
                if (reactivateTimerRef.current) {
                    clearTimeout(reactivateTimerRef.current);
                }

                reactivateTimerRef.current = setTimeout(() => {
                    reactivateTimerRef.current = null;
                }, 500);
            }
        }, [isActive, lastScannedData, scanCount, onSuccessScanned]);

        // Block unsupported Android versions
        if (Platform.OS === "android" && Platform.Version < 21) {
            return (
                <View style={styles.centered}>
                    <Icon name="camera-off" size={64} color="#666" />
                    <Text style={styles.errorText}>
                        Camera is not supported on Android versions below 5.0 (API 21).
                    </Text>
                </View>
            );
        }

        const animatedTop = animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, RECT_HEIGHT - 4],
        });

        if (cameraPermission === 'pending') {
            return (
                <View style={styles.centered}>
                    <Icon name="camera" size={48} color="#666" />
                    <Text style={styles.errorText}>Checking camera permission...</Text>
                </View>
            );
        }
        if (!device || cameraPermission === 'denied') {
            return (
                <View style={styles.centered}>
                    <Icon name="camera-off" size={64} color="#666" />
                    <Text style={styles.errorText}>
                        Camera permission denied. Please enable camera access in settings to scan IMEI.
                    </Text>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                {/* Custom Overlay */}
                <View style={styles.overlay} pointerEvents="box-none">
                    {/* Top overlay */}
                    <View style={[styles.overlaySection, { height: RECT_TOP }]} />
                    {/* Middle section with scan area */}
                    <View style={styles.middleSection}>
                        <View style={styles.sideOverlay} />
                        {/* Scan area */}
                        <View style={[styles.scanArea, { width: RECT_WIDTH, height: RECT_HEIGHT }]}>
                            <Camera
                                style={styles.camera}
                                device={device}
                                isActive={isActive}
                                codeScanner={codeScanner}
                                torch={torchOn ? 'on' : 'off'}
                                audio={false}
                            />
                            {/* Corner borders */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            {/* Animated scanning line */}
                            {isActive && (
                                <Animated.View
                                    style={[
                                        styles.scanLine,
                                        {
                                            top: animatedTop,
                                        },
                                    ]}
                                />
                            )}
                        </View>
                        <View style={styles.sideOverlay} />
                    </View>
                    {/* Bottom overlay */}
                    <View style={[styles.overlaySection, { flex: 1 }]} />
                </View>
                {/* Instructions */}
                <View style={styles.instructionContainer} pointerEvents="box-none">
                    <Text style={styles.instructionTitle}>Scan IMEI Code</Text>
                    <Text style={styles.instructionText}>
                        Position the IMEI barcode within the frame
                    </Text>
                    {scanCount > 0 && (
                        <Text style={styles.attemptText}>
                            Scan attempts: {scanCount}
                        </Text>
                    )}
                </View>
                {/* Controls */}
                <View style={styles.controlsContainer} pointerEvents="box-none">
                    <TouchableOpacity
                        style={[styles.controlButton, torchOn && styles.controlButtonActive]}
                        onPress={() => setTorchOn(!torchOn)}
                        activeOpacity={0.7}
                    >
                        <Icon
                            name={torchOn ? "flashlight" : "flashlight-off"}
                            size={24}
                            color={torchOn ? "#FFD700" : "#FFF"}
                        />
                        <Text style={[styles.controlText, torchOn && styles.controlTextActive]}>
                            {torchOn ? "Flash On" : "Flash Off"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        height: '100%',
        width: '100%',
    },
    centered: {
        flex: 1,
        ...commonStyle.center,
        backgroundColor: '#f5f5f5',
        ...commonStyle.p20
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        lineHeight: 24,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    overlaySection: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    middleSection: {
        flexDirection: 'row',
        height: RECT_HEIGHT,
    },
    sideOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    scanArea: {
        position: 'relative',
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: moderateScale(30),
        height: moderateScale(30),
        borderColor: '#00FF88',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: moderateScale(4),
        borderLeftWidth: moderateScale(4),
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: moderateScale(4),
        borderRightWidth: moderateScale(4),
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: moderateScale(4),
        borderLeftWidth: moderateScale(4),
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: moderateScale(4),
        borderRightWidth: moderateScale(4),
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: moderateScale(2),
        backgroundColor: '#00FF88',
        shadowColor: '#00FF88',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    instructionContainer: {
        position: 'absolute',
        top: RECT_TOP - getHeight(80),
        left: moderateScale(20),
        right: moderateScale(20),
        alignItems: 'center',
    },
    instructionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        color: '#CCC',
        textAlign: 'center',
        lineHeight: 20,
    },
    attemptText: {
        fontSize: 12,
        color: '#999',
        ...commonStyle.mt5
    },
    controlsContainer: {
        position: 'absolute',
        bottom: getHeight(50),
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        ...commonStyle.ph20,
        ...commonStyle.pv15,
        borderRadius: moderateScale(25),
        borderWidth: moderateScale(1),
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderColor: '#FFD700',
    },
    controlText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
        ...commonStyle.ml10
    },
    controlTextActive: {
        color: '#FFD700',
    },
});

export { IMEIScanner };