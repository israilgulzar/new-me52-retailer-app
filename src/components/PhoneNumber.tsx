// import { Fragment, useRef, useState } from 'react';
// import { useTheme } from '../theme/ThemeProvider';
// import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
// import CountryPicker, {
//   Country,
//   CountryCode,
//   CountryCodeList,
//   getCallingCode,
// } from 'react-native-country-picker-modal';
// import PhoneInput from 'react-native-phone-number-input';
// import { borderRadius, boxShadow } from '../styles/styles';
// import CaretDownWhite from "../assets/caret-down-white.svg"
// import { scaleSM, verticalScaleSM } from '../utility/helpers';

// export default function PhoneNumber({
//   label,
//   error,
//   onChangeText,
//   placeholder,
//   value,
//   name,
//   style,
//   readonly
// }: PhoneumberProps) {
//   // const [isFocused, setIsFocused] = useState(false);
//   const phoneInputRef = useRef<any>(null);
//   const { colors, theme } = useTheme();

//   const [countryCode, setCountryCode] = useState<CountryCode>('IN');
//   const [callingCode, setCallingCode] = useState('91');
//   const [modalVisible, setModalVisible] = useState(false);

//   const onCountryCodeChange = async (e: any, key?: string) => {
//     onChangeText(e.cca2, key);
//   };

//   // console.log('ME52RETAILERTESTING',"Phone input value ", readonly)

//   const showFakePlaceholder = value.phoneNumber.length < 1

//   const renderDropdownImage = () => (
//       // <Image source={require("../assets/caret-down-white.png")} style={{backgroundColor: "#fff", width: 16, height: 12, zIndex: -100}} resizeMode='contain' />
//       <CaretDownWhite style={{zIndex: -100}}/>
//   )

//   const onSelectCountry = (country: Country) => {
//     setCountryCode(country.cca2);
//     setCallingCode(country.callingCode[0]);
//     setModalVisible(false);
//   };

//   return (
//     <View style={[style]}>
//       {label && (
//         <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
//       )}
//       <View>
//       <CountryPicker
//         {...{
//           withFilter: true,
//           withFlag: true,
//           withCallingCode: true,
//           withModal: true,
//           withEmoji: true,
//           onSelect: onSelectCountry,
//           countryCode,
//         }}
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//       />
//         <PhoneInput
//           ref={phoneInputRef}
//           value={value.phoneNumber ?? ''}
//           placeholder=' '
//           defaultCode={value.countryCode}
//           layout="first"
//           disabled={readonly}
//           onChangeText={e => onChangeText(e, name?.phoneNumber)}
//           onChangeCountry={e => {
//             onCountryCodeChange(e, name?.countryCode);
//           }}
//           // textInputProps={{
//           //   onFocus: () => setIsFocused(true),
//           //   onBlur: () => setIsFocused(false)
//           //   // placeholder: placeholder
//           // }}
//           // autoFocus
//           containerStyle={[
//             styles.containerStyle,
//             boxShadow, borderRadius,
//             {
//               backgroundColor: theme == 'dark' ? '#232323' : '#FFF',
//               // borderColor: error ? colors.error : colors.border,
//               // shadowColor: theme === 'dark' ? colors.primary : undefined,
//             },
//           ]}
//           textContainerStyle={styles.textContainerStyle}
//           textInputStyle={styles.textInputStyle}
//           codeTextStyle={[styles.codeTextStyle]}
//           flagButtonStyle={[styles.flagButtonStyle, {backgroundColor: colors.orange}]}
//           countryPickerButtonStyle={{backgroundColor: colors.orange}}
//           renderDropdownImage={renderDropdownImage()}
//         />
//         {/* <TouchableOpacity onPress={() => openCountryCode()}><Text style={{color: colors.textDarker}}>Open country code</Text></TouchableOpacity> */}
//         {showFakePlaceholder && (
//             <Text style={styles.placeholder}>{placeholder}</Text>
//           )}
//       </View>
//       {error && (
//         <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderColor: '#ccc',
//     paddingBottom: 8,
//   },
//   callingCode: {
//     marginHorizontal: 8,
//     fontSize: 16,
//   },
//   label: {
//     marginBottom: 6,
//     fontWeight: '600',
//     fontSize: 15,
//   },
//   input: {
//     borderRadius: 10,
//     borderWidth: 1,
//     // padding: 12,
//     fontSize: 16,
//     marginBottom: 2,
//     flex: 1,
//   },
//   error: {
//     marginTop: 2,
//     fontSize: 13,
//   },
//   containerStyle: {
//     // borderWidth: 1,
//     borderRadius: 10,
//     width: '100%',
//     height: 51,
//   },
//   textContainerStyle: {
//     backgroundColor: 'transparent',
//     paddingVertical: 0,
//     borderTopRightRadius: 8,
//     borderBottomRightRadius: 8,
//   },
//   textInputStyle: {
//     fontSize: 16,
//     paddingVertical: 0,
//     marginLeft: 55

//   },
//   codeTextStyle: {
//     fontSize: 16,
//     position: 'absolute',
//     height: 51,
//     left: scaleSM(-5),
//     top: verticalScaleSM(-2),
//     // paddingTop: 15,
//     // paddingLeft: 10,
//     // paddingRight: 10,
//     color: "#fff",
//     borderTopLeftRadius: 16,
//     borderBottomLeftRadius: 16,
//     justifyContent: "center"
//   },
//   flagButtonStyle: {
//     position: 'absolute',
//     // borderRadius: 16,
//     paddingRight: scaleSM(10),
//     borderTopLeftRadius: 16,
//     borderBottomLeftRadius: 16,
//     width: "28%",
//     height: 51,
//     color: "#fff",
//     left: 0,
//     justifyContent: 'flex-end',
//     backgroundColor: "#fff"
//   },
//   placeholder: {
//     position: 'absolute',
//     top: '27%',
//     left: '25%', // Adjust based on layout
//     color: '#999',
//     fontSize: 16,
//   },
// });

import React, { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Modal, ViewStyle } from 'react-native';
import CountryPicker, { Country, CountryCode, getCallingCode } from 'react-native-country-picker-modal';
import PhoneInput from 'react-native-phone-number-input';
import Input from './Input';
import { useTheme } from '../theme/ThemeProvider';
import CaretDownWhite from "../assets/caret-down-white.svg"
import { getCountryCallingCode } from 'libphonenumber-js';

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
  style?: ViewStyle,
  readonly?: boolean,
  maxLength?: number
}

const PhoneNumber = ({ value, label, error, placeholder, name, style, onChangeText, readonly, maxLength }: PhoneumberProps) => {
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [countryCode, setCountryCode] = useState<CountryCode>('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [modalVisible, setModalVisible] = useState(false);
  const { colors } = useTheme()

  useEffect(() => {
    try {
      if (value?.countryCode && typeof value.countryCode === 'string' && value.countryCode.length === 2) {
        const code = getCountryCallingCode(value.countryCode as any);
        if (code) setCallingCode(String(code));
      }
    } catch (e) {
      // noop
    }
  }, [value?.countryCode]);

  const onSelectCountry = (country: Country) => {
    console.log('ME52RETAILERTESTING', "Country on change is called ", country)
    onChangeText(country.cca2, name?.countryCode);
    setCallingCode(country.callingCode[0])
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}

      <View style={styles.phoneContainer}>
        <TouchableOpacity
          style={[styles.countryPickerButton, { backgroundColor: colors.orange, flexDirection: 'row', height: 51, alignItems: 'center', justifyContent: 'space-between', top: error ? -10 : 0 }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={1}
        >
          <Text style={[styles.callingCode, { color: "#fff", fontSize: callingCode.length >= 4 ? 14 : 16 }]}>+{callingCode}</Text>
          <CaretDownWhite />
        </TouchableOpacity>

        <Input
          style={styles.input}
          placeholder={placeholder}
          value={value.phoneNumber}
          onChangeText={(e) => onChangeText(e, name?.phoneNumber)}
          keyboardType="number"
          phoneNumberPadding={90}
          maxLength={maxLength}
          error={error}
        />
      </View>

      <CountryPicker
        {...{
          withFilter: true,
          withFlag: true,
          withCallingCode: true,
          withModal: true,
          withEmoji: true,
          onSelect: onSelectCountry,
          countryCode: value.countryCode,
        }}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        containerButtonStyle={{ display: 'none' }}
      />
      {/* {error && <Text style={{ color: colors.error, fontSize: 13, marginTop: 2 }}>{error}</Text>} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    marginBottom: 20,
    // width: "95%",
    // marginHorizontal: 10
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 'bold',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 10,
    // paddingHorizontal: 10,
    height: 51,
    width: "100%"
  },
  countryPickerButton: {
    // marginRight: 10,
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
    borderBottomLeftRadius: 16
  },
  callingCode: {
    fontSize: 16,
    fontWeight: 600
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});

export default React.memo(PhoneNumber)
