import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { Country, State, City } from 'country-state-city';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, boxShadow } from '../styles/styles';
import CaretDown from "../assets/caret-down.svg"
import CaretUp from "../assets/caret-up.svg"
import { scaleSM } from '../utility/helpers';
import { Controller } from 'react-hook-form';


interface LocationPickerProps {
  control?: any;
  error?: string,
  onChangeText: (text: any, key: string) => void,
  value: string,
  name?: string,
  readonly?: boolean
  parentValue: {
    country?: string,
    state?: string
  },
  style?: ViewStyle
  rules?: any;
  defaultValue?: any;
}


const CityPicker = ({ error, onChangeText, value, readonly, parentValue, style, control,
  name,
  rules,
  defaultValue, }: LocationPickerProps) => {

  const [cities, setCities] = useState([] as any);

  const [selectedCity, setSelectedCity] = useState<any>('');

  const [openCity, setOpenCity] = useState(false);

  const { colors, theme } = useTheme()

  useEffect(() => {
    if (parentValue?.country && parentValue.state) {
      const allCities = City.getCitiesOfState(parentValue.country as string, parentValue.state as string).map((c) => ({
        label: c.name,
        value: c.name,
      }));

      setCities(allCities && allCities.length !== 0 ? allCities : [{ label: "No City", value: undefined, disabled: true }]);
    }
  }, [parentValue?.country, parentValue?.state]);

  // ✅ New: keep selectedCity in sync with prop `value`
  useEffect(() => {
    if (value && typeof value === "string") {
      setSelectedCity(value);
    }
  }, [value]);


  const loadCity = (selectedCount: string, selectedSta: string) => {

    if (!selectedCount || !selectedSta) {
      setCities([{
        label: 'Select Country and State',
        value: undefined,
        disabled: true
      }])
      return
    }
    const allCities = City.getCitiesOfState(selectedCount as string, selectedSta as string).map((c) => ({
      label: c.name,
      value: c.name,
    }));
    setCities(allCities && allCities.length !== 0 ? allCities : [{ label: "No City", value: undefined, disabled: true }]);
    // onChangeText(allCities && allCities.length !== 0 ? null : 'no_city', 'city')
  }

  return (control && name) ?
    (
      <Controller
        control={control}
        name={name}
        defaultValue={value || ''}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <View style={[styles.container]}>
            <DropDownPicker
              open={openCity}
              setOpen={setOpenCity}
              value={value}
              setValue={setSelectedCity}
              items={cities}
              disabled={readonly}
              placeholder="Select city"
              placeholderStyle={{ color: colors.textDarker }}
              zIndex={1000}
              zIndexInverse={3000}
              listMode='MODAL'
              searchable
              searchPlaceholder='Search City'
              onChangeValue={(e) => {
                if (e != value) {
                  onChange(e, 'city')
                }
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
              ArrowDownIconComponent={() => (
                <CaretDown />
              )}
              ArrowUpIconComponent={() => (
                <CaretUp />
              )}
              arrowIconContainerStyle={{
                marginRight: 20,
              }}
              onOpen={() => loadCity(parentValue?.country as string, parentValue?.state as string)}
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
        )}
      />
    ) : (
      <View style={[styles.container]}>
        <DropDownPicker
          open={openCity}
          setOpen={setOpenCity}
          value={selectedCity}
          setValue={setSelectedCity}
          items={cities}
          disabled={readonly}
          placeholder="Select city"
          placeholderStyle={{ color: colors.textDarker }}
          zIndex={1000}
          zIndexInverse={3000}
          listMode='MODAL'
          searchable
          searchPlaceholder='Search City'
          onChangeValue={(e) => {
            if (e != value) {
              onChangeText(e, 'city')
            }
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
          ArrowDownIconComponent={() => (
            <CaretDown />
          )}
          ArrowUpIconComponent={() => (
            <CaretUp />
          )}
          arrowIconContainerStyle={{
            marginRight: 20,
          }}
          onOpen={() => loadCity(parentValue?.country as string, parentValue?.state as string)}
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
    // minHeight: 100
    // marginBottom: 20
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

export default React.memo(CityPicker);
