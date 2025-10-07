import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { scaleSM } from '../utility/helpers';
import { SCREEN_WIDTH } from '../constant';
import Footer from '../components/Footer';
import { SCREENS } from '../navigation/screens';

import { forgotPasswordService } from '../services/login';
import HeaderLeft from '../components/HeaderLeft';
import CHeader from '../components/CHeader';
import CRootContainer from '../components/CRootContainer';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';

export const ForgotPasswordScreen = ({ route, navigation }: { route: any, navigation: any }) => {

	const { colors } = useTheme();
	const [email, setEmail] = useState('');
	const [error, setError] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const onSubmit = async () => {
		try {

			setLoading(true);

			if (!email) {

				setError('Please enter your email');
				setLoading(false);

			} else {

				await forgotPasswordService({ email })

				setLoading(false)

				navigation.navigate(SCREENS.OTPVerification, { email })

			}

		} catch (error: any) {
			console.log('ME52RETAILERTESTING', "On Login api throws error ", error)
			setLoading(false)
		}
	};

	return (
		<CRootContainer >
			<CHeader style={commonStyle.ph25} />
			<KeyboardAvoidingView
				style={[styles.container]}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				<View style={styles.header}>
					<Image source={require("../assets/me_secure_dark.png")} resizeMode='contain' style={{ width: moderateScale(100), height: moderateScale(100) }} />
					<Text style={{ color: colors.text, fontSize: moderateScale(28) }} numberOfLines={1}>
						Reset Password
					</Text>
				</View>

				<View style={styles.form}>
					{submitted ? (
						<Text style={{ color: colors.text }}>
							If this email exists, a reset link will be sent.
						</Text>
					) : (
						<>
							<Input
								value={email}
								onChangeText={setEmail}
								placeholder="Enter your email"
								error={error}
								style={styles.input}
							/>
							<Button
								title={loading ? 'Submitting...' : 'Submit'}
								onPress={onSubmit}
								fullWidth
								loading={loading}
								variant='darker'
								style={commonStyle.mt20}
							/>
							<Button
								title="Back to Login"
								onPress={() => navigation.goBack()}
								fullWidth
								variant='outline_darker'
								style={commonStyle.mt10}
							/>
						</>
					)}
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
		position: 'relative',
	},
	header: {
		...commonStyle.center,
		...commonStyle.mb20,
		width: "100%",
	},
	form: {
		width: "100%",
	},
	input: {
		...commonStyle.mb20,
	},
});
