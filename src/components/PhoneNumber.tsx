import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import Input from './Input';
import { useTheme } from '../theme/ThemeProvider';
import CaretDownWhite from '../assets/caret-down-white.svg';
import { getCountryCallingCode } from 'libphonenumber-js';
import { Control } from 'react-hook-form';
import CountryCodePicker from './CountryCodePicker';

interface PhoneumberProps {
  label?: string;
  error?: string;
  placeholder: string;
  onChangeText: (text: string, key?: string) => void;
  value: {
    countryCode: any;
    phoneNumber: string;
  };
  name?: {
    countryCode?: string;
    phoneNumber?: string;
  };
  style?: ViewStyle;
  readonly?: boolean;
  maxLength?: number;
  control?: Control<any>;
  rules?: any;
}

const PhoneNumber = ({
  value,
  label,
  error,
  placeholder,
  name,
  style,
  onChangeText,
  readonly,
  maxLength,
  control,
  rules,
}: PhoneumberProps) => {
  const [callingCode, setCallingCode] = useState('91');
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    try {
      if (
        value?.countryCode &&
        typeof value.countryCode === 'string' &&
        value.countryCode.length === 2
      ) {
        const code = getCountryCallingCode(value.countryCode as any);
        if (code) setCallingCode(String(code));
      }
    } catch (e) {
      // noop
    }
  }, [value?.countryCode]);

  const onSelectCountry = (country: Country) => {
    onChangeText(country.cca2, name?.countryCode);
    setCallingCode(country.callingCode[0]);
    setModalVisible(false);
  };

  const handlePhoneChange = (text: string) => {
    onChangeText(text, name?.phoneNumber);
  };

  const isControlled = !!(control && name?.phoneNumber);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View style={styles.phoneContainer}>
        {/* Country Code Selector */}
        <TouchableOpacity
          style={[
            styles.countryPickerButton,
            {
              backgroundColor: colors.orange,
              flexDirection: 'row',
              height: 51,
              alignItems: 'center',
              justifyContent: 'space-between',
              top: error ? -10 : 0,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={1}
        >
          <Text
            style={[
              styles.callingCode,
              { color: '#fff', fontSize: callingCode.length >= 4 ? 14 : 16 },
            ]}
          >
            +{callingCode}
          </Text>
          <CaretDownWhite />
        </TouchableOpacity>
        {
          isControlled ?
            <Input
              style={styles.input}
              placeholder={placeholder}
              value={isControlled ? undefined : value?.phoneNumber || ''}
              onChangeText={handlePhoneChange}
              keyboardType="number"
              phoneNumberPadding={90}
              maxLength={maxLength}
              error={error}
              control={control}
              name={name?.phoneNumber}
              rules={rules}
            />
            :
            <Input
              style={styles.input}
              placeholder={placeholder}
              value={isControlled ? undefined : value?.phoneNumber || ''}
              onChangeText={handlePhoneChange}
              keyboardType="number"
              phoneNumberPadding={90}
              maxLength={maxLength}
              error={error}
            />
        }
      </View>
      <CountryCodePicker
        visible={modalVisible}
        selectedCountryCode={value?.countryCode}
        onSelect={(country) => {
          onSelectCountry({
            cca2: country.cca2,
            callingCode: [country.callingCode],
          } as any);
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 'bold',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 51,
    width: '100%',
  },
  countryPickerButton: {
    paddingHorizontal: 8,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    width: 80,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  callingCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default React.memo(PhoneNumber);
