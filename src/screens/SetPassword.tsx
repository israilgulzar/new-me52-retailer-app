import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import Text from '../components/Text';
import { useTheme } from '../theme/ThemeProvider';
import { setPasswordService } from '../services/login';
import { useAuth } from '../context/AuthContext';
import { scaleSM } from '../utility/helpers';
import Footer from '../components/Footer';
import Toast from 'react-native-toast-message';
import ShowPassword from "../assets/eye-password-show-svgrepo-com 1.svg"
import HidePassword from "../assets/Hide.svg"
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { SCREENS } from '../navigation/screens';
import HeaderLeft from '../components/HeaderLeft';
import CRootContainer from '../components/CRootContainer';
import { moderateScale } from '../common/constants';
import CHeader from '../components/CHeader';
import { commonStyle } from '../theme';

export const SetPassword = ({ route, navigation }: { route: any, navigation: NavigationProp<any> }) => {

  const { users } = useAuth();
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowpassword] = useState(false)
  const [showConfirmPassword, setShowConfirmpassword] = useState(false)
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useFocusEffect(useCallback(() => {
    navigation.setOptions({
      title: '',
      headerStyle: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0
      },
      headerShadowVisible: false,
    })
  }, [navigation]))

  const validatePassword = (pwd: string) => {
    // At least 8 chars, one uppercase, one number, one special char
    return /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(pwd);
  };

  // Real-time validation handlers
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError('Password is required');
    } else if (!validatePassword(val)) {
      setPasswordError('Password must be at least 8 characters, include one capital letter, one number, and one special character.');
    } else {
      setPasswordError('');
    }
    // Also check confirm password match
    if (confirmpassword && val !== confirmpassword) {
      setConfirmPasswordError('Password and Confirm should be same');
    } else {
      setConfirmPasswordError('');
    }
  };
  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (!val) {
      setConfirmPasswordError('Confirm Password is required');
    } else if (password && val !== password) {
      setConfirmPasswordError('Password and Confirm should be same');
    } else {
      setConfirmPasswordError('');
    }
  };

  const onSubmit = async () => {
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (!confirmpassword) {
      setConfirmPasswordError('Confirm Password is required');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters, include one capital letter, one number, and one special character.');
      return;
    }
    if (password !== confirmpassword) {
      setConfirmPasswordError('Password and Confirm should be same');
      return;
    }
    setPasswordError('');
    setConfirmPasswordError('');
    setLoading(true);
    try {
      const res = await setPasswordService(password, users.token)
      if (res?.success) {
        setPassword("")
        setConfirmPassword("")
        Toast.show({
          type: 'success',
          text1: "User Password Updated",
          text2: "Password Updated successfully"
        })
        setLoading(false)
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: "Password Update error",
          text2: res?.message || "Something went wrong"
        })
      }

    } catch (error: any) {
      console.log('ME52RETAILERTESTING', "On Login api throws error ", error)
      const message = error.response?.data?.message || "Something when wrong"
      Toast.show({
        type: 'error',
        text1: "Password Reset error",
        text2: message
      })
      setLoading(false)
    }
  };

  return (
    <CRootContainer>
      <CHeader style={commonStyle.ph20} />
      <View style={[styles.container]}>
        <View style={styles.themeSwitchRow}>
          <Image source={require("../assets/me_secure_dark.png")} resizeMode='contain' style={{ width: moderateScale(100), height: moderateScale(100) }} />
          <Text style={{ color: colors.text, fontSize: moderateScale(32), fontWeight: 500, textAlign: 'center' }} numberOfLines={1}>Update Password</Text>
        </View>
        <View>

          <View>
            <Input
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="New password"
              secureTextEntry={!showPassword}
              error={passwordError}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowpassword(!showPassword)} activeOpacity={0.8}
              style={{ position: 'absolute', right: '5%', top: '15%' }}
            >
              {showPassword ? <ShowPassword /> : <HidePassword />}
            </TouchableOpacity>
          </View>

          <View>
            <Input
              value={confirmpassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              error={confirmPasswordError ? confirmPasswordError : ''}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmpassword(!showConfirmPassword)}
              activeOpacity={0.8}
              style={{ position: 'absolute', right: '5%', top: '15%' }}
            >
              {showConfirmPassword ? <ShowPassword /> : <HidePassword />}
            </TouchableOpacity>
          </View>

          <Button
            title={'Continue'}
            onPress={onSubmit}
            variant='darker'
            fullWidth
            style={commonStyle.mt50}
            loading={loading}
          />

        </View>
        <View>
          <Footer />
        </View>
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
    justifyContent: 'space-between'
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    ...commonStyle.mh10
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    ...commonStyle.mb20,
  },
  forgotBtn: {
  },
  themeSwitchRow: {
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyle.mb20,
    width: "100%"
  },
  themeSwitchBtn: {
    padding: 4,
  },
});
