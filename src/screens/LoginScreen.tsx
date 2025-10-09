import React, { useState, useMemo, useCallback } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	Image,
	Text,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { jwtDecode } from 'jwt-decode';
import { NavigationProp } from '@react-navigation/native';

import Input from '../components/Input';
import Button from '../components/Button';
import PhoneNumber from '../components/PhoneNumber';
import Footer from '../components/Footer';
import CRootContainer from '../components/CRootContainer';

import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../context/AuthContext';
import { loginService } from '../services/login';
import { setStore, setItem } from '../services/asyncStorage';
import { onSuccess } from '../utility/Toaster';

import ShowPassword from '../assets/eye-password-show-svgrepo-com 1.svg';
import HidePassword from '../assets/Hide.svg';
import { SCREENS } from '../navigation/screens';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import { SCREEN_WIDTH } from '../constant';

interface LoginForm {
	phoneNumber: string;
	countryCode: string;
	password: string;
}

export const LoginScreen = ({
	navigation,
}: {
	route: any;
	navigation: NavigationProp<any>;
}) => {
	const { colors } = useTheme();
	const { settingUsers } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
		watch,
	} = useForm<LoginForm>({
		defaultValues: {
			countryCode: 'IN',
			phoneNumber: __DEV__ ? '9499520855' : '',
			password: __DEV__ ? 'Test@123' : '',
		},
		mode: 'onChange',
	});

	const phoneNumber = watch('phoneNumber');
	const password = watch('password');

	/** LOGIN HANDLER **/
	const onLogin = useCallback(
		async (data: LoginForm) => {
			const { phoneNumber, countryCode, password } = data;

			if (!phoneNumber) {
				setError('phoneNumber', {
					type: 'manual',
					message: 'Please enter your phone number.',
				});
				return;
			}
			if (!password) {
				setError('password', {
					type: 'manual',
					message: 'Please enter password.',
				});
				return;
			}

			try {
				const dialingCode = getCountryCallingCode(countryCode as CountryCode);
				const response = await loginService({
					phonenumber: phoneNumber,
					countryCode: dialingCode,
					password,
				});

				const { token, type, id } = response;
				const decoded = jwtDecode(token) as any;
				const userDetails = {
					token,
					type,
					name: decoded?.name,
					id,
					nameId: decoded?.nameId,
					parentType: decoded?.parentType,
				};

				await Promise.all([
					setItem('USERID', id),
					setStore('userdetails', userDetails),
				]);

				settingUsers(userDetails);
				onSuccess('Login', 'Login Successful');
			} catch (error) {
				console.log('Login API Error:', error);
			}
		},
		[setError, settingUsers]
	);

	/** HEADER (memoized for performance) **/
	const Header = useMemo(
		() => (
			<View style={styles.themeSwitchRow}>
				<Image
					source={require('../assets/me_secure_dark.png')}
					resizeMode="contain"
					style={{ width: moderateScale(100), height: moderateScale(100) }}
				/>
				<Text
					style={[
						styles.headerTitle,
						{ color: colors.text, width: SCREEN_WIDTH },
					]}
					numberOfLines={1}
				>
					Welcome Back
				</Text>
			</View>
		),
		[colors.text]
	);

	/** PASSWORD VISIBILITY TOGGLE **/
	const togglePasswordVisibility = useCallback(() => {
		setShowPassword(prev => !prev);
	}, []);

	return (
		<CRootContainer>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				{/* Header */}
				{Header}

				{/* Form Section */}
				<View>
					{/* Phone Number */}
					<PhoneNumber
						control={control}
						name={{ phoneNumber: 'phoneNumber', countryCode: 'countryCode' }}
						value={{ countryCode: 'IN', phoneNumber }}
						rules={{
							required: 'Please enter your phone number.',
							minLength: { value: 5, message: 'Enter a valid phone number' },
						}}
						placeholder="Enter your phone number"
						error={errors.phoneNumber?.message}
						style={styles.input}
						onChangeText={() => { }}
					/>

					{/* Password */}
					<View>
						<Input
							control={control}
							name="password"
							value={password}
							onChangeText={() => { }}
							placeholder="Enter your password"
							secureTextEntry={!showPassword}
							error={errors.password?.message}
							style={styles.input}
							rules={{
								required: 'Please enter your password.',
							}}
						/>

						<TouchableOpacity
							onPress={togglePasswordVisibility}
							activeOpacity={0.8}
							style={styles.passwordIcon}
						>
							{showPassword ? <ShowPassword /> : <HidePassword />}
						</TouchableOpacity>
					</View>

					{/* Forgot Password */}
					<View style={styles.forgotRow}>
						<Text style={{ color: colors.text }}>Forgot Password?</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate(SCREENS.ForgotPassword)}
						>
							<Text style={styles.resetLink}>Reset Here</Text>
						</TouchableOpacity>
					</View>

					{/* Login Button */}
					<Button
						title={isSubmitting ? 'Signing In...' : 'Sign In'}
						onPress={handleSubmit(onLogin)}
						variant="darker"
						fullWidth
						style={commonStyle.mt50}
						loading={isSubmitting}
					/>
				</View>

				{/* Footer */}
				<Footer />
			</KeyboardAvoidingView>
		</CRootContainer>
	);
};

export default React.memo(LoginScreen);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginVertical: moderateScale(80),
		...commonStyle.ph25,
		display: 'flex',
		justifyContent: 'space-between',
		position: 'relative',
	},
	input: {
		...commonStyle.mb20,
	},
	themeSwitchRow: {
		...commonStyle.center,
		...commonStyle.mb20,
		width: '100%',
	},
	headerTitle: {
		fontSize: moderateScale(32),
		fontWeight: '500',
		textAlign: 'center',
	},
	passwordIcon: {
		position: 'absolute',
		right: '5%',
		top: '15%',
	},
	forgotRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	resetLink: {
		color: '#FF6A00',
		marginLeft: moderateScale(5),
		textDecorationLine: 'underline',
	},
});
