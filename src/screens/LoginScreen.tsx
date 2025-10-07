import React, { useState } from 'react';
import {
	View,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	TouchableOpacity,
	Image,
	Text,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import PhoneNumber from '../components/PhoneNumber';
import { useTheme } from '../theme/ThemeProvider';
import { loginService } from '../services/login';
import { jwtDecode } from 'jwt-decode';
import { setStore, setItem } from '../services/asyncStorage';
import { useAuth } from '../context/AuthContext';
import { CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import Footer from '../components/Footer';
import { onSuccess } from '../utility/Toaster';
import ShowPassword from '../assets/eye-password-show-svgrepo-com 1.svg';
import HidePassword from '../assets/Hide.svg';
import { NavigationProp } from '@react-navigation/native';
import { SCREENS } from '../navigation/screens';
import CRootContainer from '../components/CRootContainer';
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
	} = useForm<LoginForm>({
		defaultValues: {
			countryCode: 'IN',
			phoneNumber: __DEV__ ? '9499520855' : '',
			password: __DEV__ ? 'Test@123' : '',
		},
		mode: 'onChange',
	});

	const onLogin = async (data: LoginForm) => {
		const { phoneNumber, countryCode, password } = data;

		try {
			if (!phoneNumber) {
				setError('phoneNumber', { type: 'manual', message: 'Please enter your phone number.' });
				return;
			}
			if (!password) {
				setError('password', { type: 'manual', message: 'Please enter password.' });
				return;
			}

			const dialingCode = getCountryCallingCode(countryCode as CountryCode);

			const response = await loginService({
				phonenumber: phoneNumber,
				countryCode: dialingCode,
				password,
			});

			const token = response.token;
			const type = response.type;
			const decodedToken = jwtDecode(token);
			const id = response.id;
			const name = (decodedToken as any).name;
			const nameId = (decodedToken as any).nameId;
			const parentType = (decodedToken as any).parentType;

			const userDetails = { token, type, name, id, nameId, parentType };

			await setItem('USERID', id);
			settingUsers(userDetails);
			await setStore('userdetails', userDetails);

			onSuccess('Login', 'Login Successful');
		} catch (error: any) {
			console.log('Login API Error:', error);
		}
	};

	return (
		<CRootContainer>
			<KeyboardAvoidingView
				style={[styles.container]}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				{/* Header */}
				<View style={styles.themeSwitchRow}>
					<Image
						source={require('../assets/me_secure_dark.png')}
						resizeMode='contain'
						style={{ width: moderateScale(100), height: moderateScale(100) }}
					/>
					<Text
						style={{
							color: colors.text,
							fontSize: moderateScale(32),
							fontWeight: '500',
							width: SCREEN_WIDTH,
							textAlign: 'center',
						}}
						numberOfLines={1}
					>
						Welcome Back
					</Text>
				</View>

				{/* Form Section */}
				<View>
					{/* Phone Number */}
					<Controller
						control={control}
						name='phoneNumber'
						rules={{
							required: 'Please enter your phone number.',
							minLength: { value: 5, message: 'Enter a valid phone number' },
						}}
						render={({ field: { onChange, value } }) => (
							<PhoneNumber
								value={{ countryCode: 'IN', phoneNumber: value }}
								onChangeText={(e, key) => {
									if (key === 'phoneNumber') onChange(e);
								}}
								placeholder='Enter your phone number'
								error={errors.phoneNumber?.message}
								style={styles.input}
								name={{
									phoneNumber: 'phoneNumber',
									countryCode: 'countryCode',
								}}
							/>
						)}
					/>

					{/* Password */}
					<View>
						<Controller
							control={control}
							name='password'
							rules={{
								required: 'Please enter your password.',
							}}
							render={({ field: { onChange, value } }) => (
								<Input
									value={value}
									onChangeText={onChange}
									placeholder='Enter your password'
									secureTextEntry={!showPassword}
									error={errors.password?.message}
									style={styles.input}
								/>
							)}
						/>

						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
							activeOpacity={0.8}
							style={{ position: 'absolute', right: '5%', top: '15%' }}
						>
							{showPassword ? <ShowPassword /> : <HidePassword />}
						</TouchableOpacity>
					</View>

					{/* Forgot Password */}
					<View style={{ flexDirection: 'row' }}>
						<Text style={{ color: colors.text }}>Forgot Password ?</Text>
						<TouchableOpacity onPress={() => navigation.navigate(SCREENS.ForgotPassword)}>
							<Text
								style={{
									color: colors.orange,
									marginLeft: moderateScale(5),
									textDecorationLine: 'underline',
								}}
							>
								Reset Here
							</Text>
						</TouchableOpacity>
					</View>

					{/* Login Button */}
					<Button
						title={isSubmitting ? 'Signing In...' : 'Sign In'}
						onPress={handleSubmit(onLogin)}
						variant='darker'
						fullWidth
						style={commonStyle.mt50}
						loading={isSubmitting}
					/>
				</View>

				{/* Footer */}
				<View>
					<Footer />
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
		display: 'flex',
		justifyContent: 'space-between',
		position: 'relative',
	},
	card: {
		maxWidth: moderateScale(400),
		alignSelf: 'center',
		width: '100%',
		...commonStyle.mh10,
	},
	title: {
		textAlign: 'center',
		...commonStyle.mb20,
	},
	input: {
		...commonStyle.mb20,
	},
	themeSwitchRow: {
		...commonStyle.center,
		...commonStyle.mb20,
		width: '100%',
	},
});

export default LoginScreen;
