import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, boxShadow } from '../styles/styles';
import CaretDown from "../assets/caret-down.svg"
import CaretUp from "../assets/caret-up.svg"
import { scaleSM } from '../utility/helpers';
import { useCountry } from '../context/Country';

interface LocationPickerProps {
  error?: string,
  onChangeText: (text: any, key: string) => void,
  value: string,
  name?: string,
  readonly?: boolean,
  style?: ViewStyle
}

const CountryPicker = ({ error, onChangeText, value, readonly, style }: LocationPickerProps) => {

  const [countries, setCountries] = useState([] as any);
  const [selectedCountry, setSelectedCountry] = useState<any>('IN');
  const [openCountry, setOpenCountry] = useState(false);
  const { colors, theme } = useTheme()
  const { country } = useCountry()

  useEffect(() => {

    // console.log('ME52RETAILERTESTING', "Country from context", country)
    setCountries(country);

    if (value && typeof value == "string" && selectedCountry !== value) {
      // console.log('ME52RETAILERTESTING', "Setting up country ", value, "all countries ", country)
      setSelectedCountry((value as string).toUpperCase())
    }

  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <DropDownPicker
        open={openCountry}
        setOpen={setOpenCountry}
        value={selectedCountry}
        setValue={setSelectedCountry}
        items={countries}
        placeholder="Select country"
        placeholderStyle={{ color: colors.textDarker }}
        zIndex={3000}
        zIndexInverse={1000}
        listMode='MODAL'
        searchable
        disabled={readonly}
        searchPlaceholder='Search Country'
        onChangeValue={(e) => {
          if (e != value) {
            onChangeText(e, "country")
          }
        }}
        ArrowDownIconComponent={() => (
          <CaretDown />
        )}
        ArrowUpIconComponent={() => {
          <CaretUp />
        }}
        modalProps={{
          animationType: 'slide',
          presentationStyle: 'pageSheet'
        }}
        modalContentContainerStyle={{
          backgroundColor: "#fff",
          borderWidth: 0,
          marginHorizontal: scaleSM(20),
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          flexGrow: 1,
          overflow: "hidden"
        }}
        searchContainerStyle={[{ borderBottomWidth: 0, marginTop: scaleSM(15), padding: 0 }]}
        searchTextInputStyle={[boxShadow, { borderWidth: 0, backgroundColor: "#fff", paddingHorizontal: scaleSM(15), paddingVertical: scaleSM(5), marginHorizontal: scaleSM(5) }]}
        arrowIconContainerStyle={{
          marginRight: 20,
        }}
        style={[{
          backgroundColor: theme == 'dark' ? '#232323' : '#FFF',
          borderColor: error && colors.error,
          // shadowColor: theme === 'dark' ? colors.primary : undefined,
          borderWidth: error ? 1 : 0,
          // marginBottom: 10
        }, boxShadow, borderRadius]}
      />
      {error && <Text style={[{ color: colors.error }]}>{error}</Text>}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    // marginBottom: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '600',
  },
  codeText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(CountryPicker);
