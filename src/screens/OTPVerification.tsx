import React, { useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { NavigationProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Button from '../components/Button';
import Text from '../components/Text';
import Footer from '../components/Footer';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { moderateScale } from '../common/constants';
import { SCREENS } from '../navigation/screens';
import { boxShadow } from '../styles/styles';
import { commonStyle } from '../theme';
import { verifyOTPService } from '../services/login';

export const OTPVerification = ({ route, navigation }: { route: any; navigation: NavigationProp<any> }) => {
	const email = route.params.email;
	const { theme, colors } = useTheme();
	const { users } = useAuth();
	const inputs = useRef<any>([]);
	const [loading, setLoading] = useState(false);

	const { control, handleSubmit, setValue, getValues, reset } = useForm({
		defaultValues: {
			code: ['', '', '', ''],
		},
	});

	const handleChange = (text: string, index: number) => {
		const chars = text.split('');
		const newCode = [...getValues('code')];

		if (chars.length === 1) {
			newCode[index] = chars[0];
			setValue('code', newCode);
			if (index < inputs.current.length - 1) inputs.current[index + 1]?.focus();
		} else if (chars.length > 1) {
			chars.forEach((char, i) => {
				if (index + i < 4) newCode[index + i] = char;
			});
			setValue('code', newCode);
		}
	};

	const handleKeyPress = (e: any, index: number) => {
		const { key } = e.nativeEvent;
		const codeArray = getValues('code');

		if (key === 'Backspace') {
			if (codeArray[index]) {
				const newCode = [...codeArray];
				newCode[index] = '';
				setValue('code', newCode);
			} else if (index > 0) {
				inputs.current[index - 1]?.focus();
				const newCode = [...codeArray];
				newCode[index - 1] = '';
				setValue('code', newCode);
			}
		}
	};

	const onLogin = async (data: { code: string[] }) => {
		const codeValue = data.code.join('');
		if (codeValue.length < 4) {
			return Toast.show({
				type: 'error',
				text1: 'Invalid OTP',
				text2: 'Please enter a valid OTP',
			});
		}

		setLoading(true);
		try {
			const res = await verifyOTPService(email, codeValue, users.token);
			if (res?.success) {
				navigation.navigate(SCREENS.ResetPassword, { code: codeValue, email });
			} else {
				reset({ code: ['', '', '', ''] });
				inputs.current[0]?.focus();
				Toast.show({
					type: 'error',
					text1: 'OTP Verification Failed',
					text2: res?.message || 'Something went wrong',
				});
			}
		} catch (error) {
			reset({ code: ['', '', '', ''] });
			inputs.current[0]?.focus();
			Toast.show({
				type: 'error',
				text1: 'OTP Verification Failed',
				text2: error ?? 'Something went wrong',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<CRootContainer>
			<CHeader style={commonStyle.ph25} />
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.themeSwitchRow}>
					<Image
						source={require('../assets/me_secure_dark.png')}
						resizeMode="contain"
						style={{ width: moderateScale(100), height: moderateScale(100) }}
					/>
					<Text style={{ color: colors.text, fontSize: moderateScale(32) }} numberOfLines={1}>
						OTP Verification
					</Text>
				</View>

				<View>
					<View style={commonStyle.mb20}>
						<Text style={{ color: colors.textLight, textAlign: 'center' }}>
							Enter otp number we’ve send to
						</Text>
						<Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
							{email ?? 'test@mail.com'}
						</Text>
					</View>

					<View style={styles.otpcontainer}>
						{[0, 1, 2, 3].map((index) => (
							<Controller
								key={index}
								control={control}
								name={`code.${index}`}
								render={({ field: { value } }) => (
									<View
										style={[
											boxShadow,
											{
												backgroundColor: '#fff',
												height: moderateScale(50),
												width: moderateScale(40),
												padding: 0,
												borderRadius: moderateScale(5),
											},
										]}
									>
										<TextInput
											ref={(ref: any) => (inputs.current[index] = ref)}
											style={{ color: colors.orange, fontSize: 18 }}
											keyboardType="number-pad"
											maxLength={1}
											value={value}
											onChangeText={(text) => handleChange(text, index)}
											onKeyPress={(e) => handleKeyPress(e, index)}
											autoFocus={index === 0}
											textAlign="center"
										/>
									</View>
								)}
							/>
						))}
					</View>

					<Button
						title="Continue"
						onPress={handleSubmit(onLogin)}
						variant="darker"
						fullWidth
						style={commonStyle.mt50}
						loading={loading}
					/>

					<View style={{ position: 'absolute', bottom: '-70%', alignSelf: 'center' }}>
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
		...commonStyle.ph25,
	},
	themeSwitchRow: {
		...commonStyle.mb10,
		...commonStyle.center,
		width: '100%',
	},
	otpcontainer: {
		flexDirection: 'row',
		gap: moderateScale(15),
		justifyContent: 'center',
		...commonStyle.mv20,
	},
});
