import React from 'react';
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { resetPasswordService } from '../services/login';
import Footer from '../components/Footer';
import Toast from 'react-native-toast-message';
import ShowPassword from "../assets/eye-password-show-svgrepo-com 1.svg";
import HidePassword from "../assets/Hide.svg";
import { NavigationProp } from '@react-navigation/native';
import { SCREENS } from '../navigation/screens';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';

interface ResetPasswordForm {
    password: string;
    confirmPassword: string;
}

export const ResetPassword = ({
    route,
    navigation,
}: {
    route: any;
    navigation: NavigationProp<any>;
}) => {
    const code = route.params.code;
    const email = route.params.email;

    const { colors } = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setError,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ResetPasswordForm>({
        defaultValues: { password: '', confirmPassword: '' },
        mode: 'onChange',
    });

    const passwordValue = watch('password');

    const validatePassword = (pwd: string) => {
        return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd);
    };

    const onSubmit = async (data: ResetPasswordForm) => {
        const { password, confirmPassword } = data;

        // Manual checks to match your previous logic
        if (!password) {
            setError('password', { type: 'manual', message: 'Password is required' });
            return;
        }
        if (!confirmPassword) {
            setError('confirmPassword', { type: 'manual', message: 'Confirm Password is required' });
            return;
        }
        if (!validatePassword(password)) {
            setError('password', {
                type: 'manual',
                message:
                    'Password must be at least 8 characters, include one capital letter, one number, and one special character.',
            });
            return;
        }
        if (password !== confirmPassword) {
            setError('confirmPassword', {
                type: 'manual',
                message: 'Password and Confirm should be same',
            });
            return;
        }

        try {
            await resetPasswordService({ resetCode: Number(code), email, password });

            Toast.show({
                type: 'success',
                text1: 'User Password Reset',
                text2: 'Password reset successfully',
            });

            reset();

            navigation.navigate(SCREENS.Login);
        } catch (error: any) {
            console.log('Reset Password API Error:', error);
            const message = error.response?.data?.message || 'Something went wrong';
            Toast.show({
                type: 'error',
                text1: 'Password Reset Error',
                text2: message,
            });
        }
    };

    return (
        <CRootContainer>
            <CHeader style={commonStyle.ph25} />
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
                    <Text style={{ color: colors.text, fontSize: moderateScale(32) }} numberOfLines={1}>
                        Set Password
                    </Text>
                </View>

                {/* Form */}
                <View>
                    {/* Password Input */}
                    <View>
                        <Controller
                            control={control}
                            name='password'
                            rules={{
                                required: 'Password is required',
                                validate: (val) =>
                                    validatePassword(val) ||
                                    'Password must be at least 8 characters, include one capital letter, one number, and one special character.',
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder='New password'
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

                    {/* Confirm Password Input */}
                    <View>
                        <Controller
                            control={control}
                            name='confirmPassword'
                            rules={{
                                required: 'Confirm Password is required',
                                validate: (val) =>
                                    val === passwordValue || 'Password and Confirm should be same',
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder='Confirm password'
                                    secureTextEntry={!showConfirmPassword}
                                    error={errors.confirmPassword?.message}
                                    style={styles.input}
                                />
                            )}
                        />

                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            activeOpacity={0.8}
                            style={{ position: 'absolute', right: '5%', top: '15%' }}
                        >
                            {showConfirmPassword ? <ShowPassword /> : <HidePassword />}
                        </TouchableOpacity>
                    </View>

                    {/* Back to Login */}
                    <View style={{ flexDirection: 'row' }}>
                        <Text variant='caption'>Go to Login ?</Text>
                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => navigation.navigate(SCREENS.Login)}
                        >
                            <Text
                                variant='caption'
                                style={{
                                    color: colors.orange,
                                    marginLeft: moderateScale(5),
                                    textDecorationLine: 'underline',
                                }}
                            >
                                Click Here
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <Button
                        title={isSubmitting ? 'Submitting...' : 'Continue'}
                        onPress={handleSubmit(onSubmit)}
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
    forgotBtn: {},
    themeSwitchRow: {
        ...commonStyle.mb20,
        ...commonStyle.center,
        width: '100%',
    },
});

export default ResetPassword;
