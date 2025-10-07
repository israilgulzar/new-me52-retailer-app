import React, { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, TextInput } from 'react-native';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { scaleSM } from '../utility/helpers';
import Footer from '../components/Footer';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '../navigation/screens';
import HeaderLeft from '../components/HeaderLeft';
import { boxShadow } from '../styles/styles';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import Toast from 'react-native-toast-message';
import { verifyOTPService } from '../services/login';


export const OTPVerification = ({ route, navigation }: { route: any, navigation: NavigationProp<any> }) => {

	const email = route.params.email;
	const { theme, toggleTheme, colors } = useTheme();
	const { users } = useAuth()
	const [code, setCode] = useState<string[]>(['', '', '', ''])
	const [loading, setLoading] = useState(false);
	const inputs = useRef<any>([]);

	const onLogin = async () => {
		// can you add validation 
		if (code.join("").length < 4) {
			return Toast.show({
				type: 'error',
				text1: 'Invalid OTP',
				text2: 'Please enter a valid OTP'
			});
		}
		setLoading(true);
		try {
			const res = await verifyOTPService(email, code.join(""), users.token)
			if (res?.success) {
				navigation.navigate(SCREENS.ResetPassword, { code: code.join(""), email });
			} else {
				setCode(['', '', '', '']);
				inputs.current[0]?.focus();
				Toast.show({
					type: 'error',
					text1: 'OTP Verification Failed',
					text2: res?.message || 'Something went wrong'
				});
			}
		} catch (error) {
			Toast.show({
				type: 'error',
				text1: 'OTP Verification Failed',
				text2: error ?? 'Something went wrong'
			});
			setCode(['', '', '', '']);
			inputs.current[0]?.focus();
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (text: string, index: number) => {
		const chars = text.split('');
		const newCode = [...code];

		if (chars.length === 1) {
			newCode[index] = chars[0];
			setCode(newCode);
			if (index < inputs.current.length - 1) {
				inputs.current[index + 1]?.focus();
			}
		} else if (chars.length > 1) {
			// handle paste of entire code
			chars.forEach((char, i) => {
				if (index + i < 4) {
					newCode[index + i] = char;
				}
			});
			setCode(newCode);
		}
	};

	const handleKeyPress = (e: any, index: number) => {
		const { key } = e.nativeEvent;
		if (key === 'Backspace') {
			if (code[index]) {
				const newCode = [...code];
				newCode[index] = '';
				setCode(newCode);
			} else if (index > 0) {
				inputs.current[index - 1]?.focus();
				const newCode = [...code];
				newCode[index - 1] = '';
				setCode(newCode);
			}
		}
	};

	return (
		<CRootContainer >
			<CHeader style={commonStyle.ph25} />
			<KeyboardAvoidingView
				style={[styles.container]}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.themeSwitchRow}>
					<Image source={require("../assets/me_secure_dark.png")} resizeMode='contain' style={{ width: moderateScale(100), height: moderateScale(100) }} />
					<Text
						style={{
							color: colors.text,
							fontSize: moderateScale(32),
						}}
						numberOfLines={1}
					>
						OTP Verification
					</Text>
				</View>
				<View>
					<View style={commonStyle.mb20}>
						<Text style={{ color: colors.textLight, textAlign: 'center' }}>Enter otp number we’ve send to</Text>
						<Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>{email ?? 'test@mail.com'}</Text>
					</View>
					<View style={[styles.otpcontainer]}>
						{code.map((digit: any, index: number) => (
							<View style={[boxShadow, { backgroundColor: "#fff", height: getHeight(50), width: moderateScale(40), padding: 0, borderRadius: moderateScale(5), }]}>
								<TextInput
									key={index}
									ref={((ref) => (inputs.current[index] = ref) as any)}
									style={[{ color: colors.orange, fontSize: 18 }]}
									keyboardType="number-pad"
									maxLength={1}
									value={digit}
									onChangeText={(text) => handleChange(text, index)}
									onKeyPress={(e) => handleKeyPress(e, index)}
									autoFocus={index === 0}
									textAlign="center"
								/>
							</View>
						))}
					</View>
					<Button
						title={'Continue'}
						onPress={onLogin}
						variant='darker'
						fullWidth
						style={commonStyle.mt50}
						loading={loading}
					/>
					<View style={{ position: 'absolute', bottom: "-70%", alignSelf: 'center' }}>
						<Footer />
					</View>
				</View>
			</KeyboardAvoidingView>
		</CRootContainer>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginVertical: moderateScale(80),
		...commonStyle.ph25
	},
	card: {
		maxWidth: moderateScale(400),
		alignSelf: 'center',
		width: '100%',
		...commonStyle.mh10

	},
	title: {
		textAlign: 'center',
		...commonStyle.mb20
	},
	themeSwitchRow: {
		...commonStyle.mb10,
		...commonStyle.center,
		width: "100%"
		// marginRight: 8,
		// width: 200,
		// height: 200
	},
	otpcontainer: {
		flexDirection: 'row',
		gap: moderateScale(15),
		justifyContent: 'center',
		...commonStyle.mv20
	},
	otpinput: {
		width: moderateScale(40),
		height: getHeight(50),
		// borderWidth: 1,
		// borderColor: '#aaa',
		// borderRadius: 8,
		fontSize: 24,
		textAlign: 'center',
	},
});
