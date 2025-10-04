// SignPad.tsx
import React, { useRef, useState, useEffect } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	ViewStyle,
} from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import { useTheme } from '../theme/ThemeProvider';
import CrossIcon from "../assets/cross.svg";
import Add from "../assets/add.svg";
import Button from './Button';
import NavigationBack from '../assets/navigation_back.svg';
import { getHeight, moderateScale } from "../common/constants";
import { commonStyle } from "../theme";
import Footer from "./Footer";

interface SignPadProps {
	value?: string; // base64 signature from parent
	onChangeText: (signature: string) => void;
	label?: string;
	error?: string;
	buttonText?: string;
	readonly?: boolean;
	style?: ViewStyle;
	name?: string;
}

const SignPad: React.FC<SignPadProps> = ({ label, value, onChangeText, error, readonly, style }) => {

	const { colors } = useTheme();
	const [modalVisible, setModalVisible] = useState(false);
	const signRef = useRef<SignatureViewRef>(null);

	const handleOK = (sig: string) => {
		onChangeText(sig);
		setModalVisible(false);
	};

	const handleClear = () => {
		signRef.current?.clearSignature();
	};

	const clearSignature = () => onChangeText?.('');
	const onSaveSignature = () => {
		signRef.current?.readSignature();
		setTimeout(() => setModalVisible(false), 1000);
	}

	return (
		<View>
			{/* Show signature preview if available */}
			<View style={[styles.container, style]}>
				{label && <Text style={[{ color: colors.textDarker }, styles.label]}>{label}</Text>}

				<TouchableOpacity
					activeOpacity={0.8}
					onPress={() => setModalVisible(true)}
					disabled={readonly}
				>
					<View style={{
						width: '100%',
						borderRadius: 8,
						borderWidth: 2,
						borderStyle: 'dashed',
						borderColor: error ? colors.error : '#ccc',
						height: 100,
						justifyContent: 'center',
						alignItems: 'center'
					}}>
						{!value ? (
							<Add />
						) : (
							<View style={styles.signaturePreview}>
								<Image source={{ uri: value }} style={styles.signaturePreview} resizeMode="contain" />
								{!readonly && (
									<TouchableOpacity style={{ position: 'absolute', right: 5, top: 5 }} onPress={clearSignature}>
										<CrossIcon />
									</TouchableOpacity>
								)}
							</View>
						)}
					</View>
				</TouchableOpacity>

				{error && <Text style={{ color: colors.error, fontSize: 13, marginTop: 2 }}>{error}</Text>}
			</View>

			{/* Modal with Signature Pad */}
			<Modal visible={modalVisible} animationType="slide">
				<View style={styles.rowContainer}>
					<TouchableOpacity
						onPress={() => setModalVisible(false)}
						style={{ marginRight: moderateScale(10), bottom: 0, marginVertical: moderateScale(10) }}
					>
						<NavigationBack height={moderateScale(40)} width={moderateScale(40)} />
					</TouchableOpacity>
					<Text style={{ fontSize: moderateScale(18), fontWeight: '500', color: colors.text }}>{'Signature Pad'}</Text>
				</View>
				<View style={styles.modalContainer}>
					<SignatureScreen
						ref={signRef}
						webStyle={padStyle}           // 👈 uses 100% heights (not 100vh)
						onOK={handleOK}
						onEmpty={() => console.log("No signature")}
						descriptionText="Sign above"
						clearText="Clear"
						confirmText="OK"
						dataURL={value || ""}   // 👈 preload signature if exists
					/>

					<View style={styles.buttonContainer}>
						<TouchableOpacity style={styles.refreshButton} onPress={handleClear} activeOpacity={0.8}>
							<Image source={require("../assets/refresh.png")} style={{ width: moderateScale(28), height: moderateScale(28) }} />
						</TouchableOpacity>
						<Button title='Save' variant='darker' onPress={() => onSaveSignature()} style={styles.saveButton} />
					</View>
					<Footer />
					{/* Extra Actions */}
				</View>
			</Modal>
		</View>
	);
};


const styles = StyleSheet.create({
	container: {
		...commonStyle.mt20
	},
	signaturePreview: {
		width: '100%', height: getHeight(100),
		resizeMode: 'contain',
	},
	label: {
		...commonStyle.mb10, fontWeight: '600', fontSize: 15
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		...commonStyle.mh25,
		...commonStyle.mt25,
	},
	saveButton: {
		width: '80%',
		height: getHeight(48),
		marginVertical: 0
	},
	refreshButton: {
		backgroundColor: '#F3931454',
		borderRadius: moderateScale(16),
		width: moderateScale(58),
		height: getHeight(48),
		...commonStyle.center
	},
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	rowContainer: {
		...commonStyle.rowStart,
		...commonStyle.pv10,
		...commonStyle.ph25,
	}
});


const padStyle = `
  html, body {
    margin: 20;
    padding: 0;
    height: 100%;
    background-color: rgba(255, 255, 255, 1) !important;
  }
  .m-signature-pad {
    box-shadow: none;
    border: none;
    height: 100% !important;
    background-color: rgba(217, 217, 217, 1) !important;
    border-radius: 30px;
    margin: 0 20px;
    width: calc(100% - 40px) !important;
  }
  .m-signature-pad--body {
    border: none;
    height: 100% !important;
    width: 100% !important;
    background-color: rgba(255, 255, 255, 1) !important;
  }
  .m-signature-pad--footer { display: none !important; }
  canvas {
    background-color: rgba(217, 217, 217, 1) !important;
    height: 100% !important;
    width: 100% !important;
    border: none;
    border-radius: 30px !important;
  }
`;

export default SignPad;


