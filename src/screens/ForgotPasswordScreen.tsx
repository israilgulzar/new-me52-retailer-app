import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { SCREEN_WIDTH } from '../constant';
import Footer from '../components/Footer';
import { SCREENS } from '../navigation/screens';
import { forgotPasswordService } from '../services/login';
import CHeader from '../components/CHeader';
import CRootContainer from '../components/CRootContainer';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';

interface ForgotPasswordForm {
	email: string;
}

export const ForgotPasswordScreen = ({ route, navigation }: { route: any; navigation: any }) => {
	const { colors } = useTheme();

	const {
		control,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordForm>({
		defaultValues: { email: '' },
	});

	const [submitted, setSubmitted] = React.useState(false);

	const onSubmit = async (data: ForgotPasswordForm) => {
		try {
			const { email } = data;

			// Basic validation
			if (!email.trim()) {
				setError('email', { type: 'manual', message: 'Please enter your email' });
				return;
			}

			await forgotPasswordService({ email });

			setSubmitted(true);

			// Navigate after success
			navigation.navigate(SCREENS.OTPVerification, { email });
		} catch (error: any) {
			console.log('ForgotPassword Error:', error);
		}
	};

	return (
		<CRootContainer>
			<CHeader style={commonStyle.ph25} />

			<KeyboardAvoidingView
				style={[styles.container]}
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			>
				{/* Header Section */}
				<View style={styles.header}>
					<Image
						source={require('../assets/me_secure_dark.png')}
						resizeMode='contain'
						style={{ width: moderateScale(100), height: moderateScale(100) }}
					/>
					<Text style={{ color: colors.text, fontSize: moderateScale(28) }} numberOfLines={1}>
						Reset Password
					</Text>
				</View>

				{/* Form Section */}
				<View style={styles.form}>
					{submitted ? (
						<Text style={{ color: colors.text }}>
							If this email exists, a reset link will be sent.
						</Text>
					) : (
						<>
							<Controller
								control={control}
								name='email'
								rules={{
									required: 'Please enter your email',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Please enter a valid email address',
									},
								}}
								render={({ field: { onChange, value } }) => (
									<Input
										value={value}
										onChangeText={onChange}
										placeholder='Enter your email'
										error={errors.email?.message}
										style={styles.input}
									/>
								)}
							/>

							<Button
								title={isSubmitting ? 'Submitting...' : 'Submit'}
								onPress={handleSubmit(onSubmit)}
								fullWidth
								loading={isSubmitting}
								variant='darker'
								style={commonStyle.mt20}
							/>

							<Button
								title='Back to Login'
								onPress={() => navigation.goBack()}
								fullWidth
								variant='outline_darker'
								style={commonStyle.mt10}
							/>
						</>
					)}
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
	header: {
		...commonStyle.center,
		...commonStyle.mb20,
		width: '100%',
	},
	form: {
		width: '100%',
	},
	input: {
		...commonStyle.mb20,
	},
});

export default ForgotPasswordScreen;
