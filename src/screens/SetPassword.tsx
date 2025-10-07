import React, { useCallback, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { setPasswordService } from '../services/login';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import Toast from 'react-native-toast-message';
import ShowPassword from "../assets/eye-password-show-svgrepo-com 1.svg"
import HidePassword from "../assets/Hide.svg"
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

export const SetPassword = ({ route, navigation }: { route: any, navigation: NavigationProp<any> }) => {
  const { users } = useAuth();
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setError, clearErrors, reset } = useForm({
    defaultValues: {
      password: '',
      confirmpassword: ''
    }
  });

  const passwordValue = watch('password');
  const confirmpasswordValue = watch('confirmpassword');

  useFocusEffect(useCallback(() => {
    navigation.setOptions({
      title: '',
      headerStyle: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
      headerShadowVisible: false,
    });
  }, [navigation]));

  const validatePassword = (pwd: string) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd);

  const onSubmit = async (data: { password: string; confirmpassword: string }) => {
    const { password, confirmpassword } = data;

    // Manual validations using RHF errors
    if (!password) {
      setError('password', { type: 'manual', message: 'Password is required' });
      return;
    }
    if (!validatePassword(password)) {
      setError('password', {
        type: 'manual',
        message: 'Password must be at least 8 characters, include one capital letter, one number, and one special character.',
      });
      return;
    }
    if (!confirmpassword) {
      setError('confirmpassword', { type: 'manual', message: 'Confirm Password is required' });
      return;
    }
    if (password !== confirmpassword) {
      setError('confirmpassword', { type: 'manual', message: 'Password and Confirm should be same' });
      return;
    }

    clearErrors();
    setLoading(true);
    try {
      const res = await setPasswordService(password, users.token);
      if (res?.success) {
        Toast.show({ type: 'success', text1: 'User Password Updated', text2: 'Password Updated successfully' });
        reset();
        navigation.goBack();
      } else {
        Toast.show({ type: 'error', text1: 'Password Update error', text2: res?.message || 'Something went wrong' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      Toast.show({ type: 'error', text1: 'Password Reset error', text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CRootContainer>
      <CHeader style={commonStyle.ph20} />
      <View style={[styles.container]}>
        <View style={styles.themeSwitchRow}>
          <Image
            source={require("../assets/me_secure_dark.png")}
            resizeMode="contain"
            style={{ width: moderateScale(100), height: moderateScale(100) }}
          />
          <Text
            style={{ color: colors.text, fontSize: moderateScale(32), fontWeight: '500', textAlign: 'center' }}
            numberOfLines={1}
          >
            Update Password
          </Text>
        </View>

        <View>
          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <>
                  <Input
                    value={value}
                    onChangeText={(val) => {
                      onChange(val);
                      if (confirmpasswordValue && val !== confirmpasswordValue) {
                        setError('confirmpassword', { type: 'manual', message: 'Password and Confirm should be same' });
                      } else {
                        clearErrors('confirmpassword');
                      }
                    }}
                    placeholder="New password"
                    secureTextEntry={!showPassword}
                    error={error?.message}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.8}
                    style={{ position: 'absolute', right: '5%', top: '15%' }}
                  >
                    {showPassword ? <ShowPassword /> : <HidePassword />}
                  </TouchableOpacity>
                </>
              )}
            />
          </View>

          <View>
            <Controller
              control={control}
              name="confirmpassword"
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <>
                  <Input
                    value={value}
                    onChangeText={(val) => {
                      onChange(val);
                      if (passwordValue && val !== passwordValue) {
                        setError('confirmpassword', { type: 'manual', message: 'Password and Confirm should be same' });
                      } else {
                        clearErrors('confirmpassword');
                      }
                    }}
                    placeholder="Confirm password"
                    secureTextEntry={!showConfirmPassword}
                    error={error?.message}
                    style={styles.input}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.8}
                    style={{ position: 'absolute', right: '5%', top: '15%' }}
                  >
                    {showConfirmPassword ? <ShowPassword /> : <HidePassword />}
                  </TouchableOpacity>
                </>
              )}
            />
          </View>

          <Button
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            variant="darker"
            fullWidth
            style={commonStyle.mt50}
            loading={loading}
          />
        </View>

        <Footer />
      </View>
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: moderateScale(40),
    ...commonStyle.ph20,
    display: 'flex',
    justifyContent: 'space-between',
  },
  input: {
    ...commonStyle.mb20,
  },
  themeSwitchRow: {
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyle.mb20,
    width: '100%',
  },
});
