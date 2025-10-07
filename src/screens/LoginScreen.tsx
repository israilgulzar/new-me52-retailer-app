import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image, Text } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import { loginService } from '../services/login';
import { jwtDecode } from 'jwt-decode';
import { setStore, setItem } from '../services/asyncStorage';
import { useAuth } from '../context/AuthContext';
import PhoneNumber from '../components/PhoneNumber';
import { CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { SCREEN_WIDTH } from '../constant';
import Footer from '../components/Footer';
import { onSuccess } from '../utility/Toaster';
import ShowPassword from "../assets/eye-password-show-svgrepo-com 1.svg"
import HidePassword from "../assets/Hide.svg"
import { NavigationProp } from '@react-navigation/native';
import { SCREENS } from '../navigation/screens';

import CRootContainer from '../components/CRootContainer';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

export const LoginScreen = ({ navigation }: { route: any, navigation: NavigationProp<any> }) => {

	const { colors } = useTheme();
	const { settingUsers } = useAuth()
	const [phonenumber, setPhonenumber] = useState(
		__DEV__ ?
			{ countryCode: 'IN', phoneNumber: '9499520855' } :
			{ countryCode: 'IN', phoneNumber: '' }
	);
	const [password, setPassword] = useState(__DEV__ ? 'Test@123' : '');
	const [error, setError] = useState('');
	const [passError, setPassError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowpassword] = useState(false)

	const onLogin = async () => {
		try {

			if (!phonenumber.phoneNumber) {
				return setError('Please enter your phone number.')
			} else if (!password) {
				setError('')
				return setPassError('Please enter password.')
			} else {
				setError('')
				setPassError('')
			}
			setLoading(true);

			const phonenum = phonenumber.phoneNumber
			const countryCode = getCountryCallingCode(phonenumber.countryCode as CountryCode)

			const response = await loginService({ phonenumber: phonenum, countryCode, password })

			const token = response.token
			const type = response.type
			const decodedToken = jwtDecode(token)

			const id = response.id
			const name = (decodedToken as any).name;
			const nameId = (decodedToken as any).nameId;
			const parentType = (decodedToken as any).parentType;

			const userDetails = { token: token, type: type, name: name, id, nameId, parentType };

			console.log('ME52RETAILERTESTING', "Userdetails here ", userDetails)

			console.log('yah aarha he')
			await setItem('USERID', id);

			settingUsers(userDetails);

			await setStore("userdetails", userDetails)
			onSuccess("Login", "Login Successfull")
			setLoading(false)

		} catch (error: any) {
			console.log('ME52RETAILERTESTING', "On Login api throws error ", error)
			setLoading(false)
		}
	};

	const handlePhoneNumberChange = (event: string, key: string) => {
		setPhonenumber((prev) => ({ ...prev, [key as keyof typeof phonenumber]: event }))
	}

	return (
		<CRootContainer >
			<KeyboardAvoidingView
				style={[styles.container]}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.themeSwitchRow}>
					<Image source={require("../assets/me_secure_dark.png")} resizeMode='contain' style={{ width: moderateScale(100), height: moderateScale(100) }} />
					<Text style={{ color: colors.text, fontSize: moderateScale(32), fontWeight: 500, width: SCREEN_WIDTH, textAlign: 'center' }} numberOfLines={1}>Welcome Back</Text>
				</View>
				<View>
					<PhoneNumber
						value={phonenumber}
						onChangeText={(e, key) => handlePhoneNumberChange(e, key as string)}
						placeholder="Enter your phone number"
						error={error}
						style={styles.input}
						name={{
							phoneNumber: "phoneNumber",
							countryCode: "countryCode"
						}}
					/>
					<View>
						<Input
							value={password}
							onChangeText={setPassword}
							placeholder="Enter your password"
							secureTextEntry={!showPassword}
							error={passError}
							style={styles.input}
						/>
						<TouchableOpacity
							onPress={() => setShowpassword(!showPassword)}
							activeOpacity={0.8}
							style={{ position: 'absolute', right: '5%', top: '15%' }}
						>
							{showPassword ? <ShowPassword /> : <HidePassword />}
						</TouchableOpacity>
					</View>

					<View style={{ flexDirection: "row" }}>
						<Text style={{
							color: colors.text
						}}>
							Forgot Password ?
						</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate(SCREENS.ForgotPassword)}
						>
							<Text
								style={{ color: colors.orange, marginLeft: moderateScale(5), textDecorationLine: 'underline' }}>
								Reset Here
							</Text>
						</TouchableOpacity>
					</View>
					<Button
						title={loading ? 'Signing In...' : 'Sign In'}
						onPress={() => onLogin()}
						variant='darker'
						fullWidth
						style={commonStyle.mt50}
						loading={loading}
					/>

					{/* </Card> */}
				</View>
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
		position: 'relative'
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
	input: {
		...commonStyle.mb20
	},
	themeSwitchRow: {
		...commonStyle.center,
		...commonStyle.mb20,
		width: "100%"
	},
});
