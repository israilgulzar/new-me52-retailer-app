import RNDateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useState } from 'react';
import { borderRadius, boxShadow, inputPadding } from '../styles/styles';
import { Controller } from 'react-hook-form';

interface DatePickerProps {
  value: number;
  error?: string;
  label?: string;
  onChangeText: (value: number) => void;
  style?: ViewStyle;
  readonly?: boolean,
  maxDate?: Number,
  minDate?: Date,
  placeholder?: string,
  control?: any
  name?: any
  rules?: any
}

const Datepicker = ({
  value,
  error,
  label,
  onChangeText,
  style,
  readonly,
  maxDate,
  placeholder,
  minDate,
  control,
  rules,
  name
}: DatePickerProps) => {
  const [show, setShow] = useState(false)
  const { colors, theme } = useTheme();

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    console.log('ME52RETAILERTESTING', "On date change event ", event, " selected date ", selectedDate)
    if (event.type == "dismissed") {
      setShow(false)
      return
    }
    if (event.type == "set") {
      setShow(false)
      onChangeText(event.nativeEvent.timestamp / 1000);
    }

  };

  // console.log('ME52RETAILERTESTING',"Value of date range ", value)

  const openDatePicker = (pickerMode: any) => {
    setShow(true)
    // if (Platform.OS === 'android') {
    //   DateTimePickerAndroid.open({
    //     value: value ? new Date(value * 1000) : new Date(),
    //     onChange: onDateChange,
    //     mode: pickerMode,
    //     is24Hour: true,
    //     maximumDate: maxDate ? new Date(maxDate * 1000) : new Date(),
    //     minimumDate: new Date(new Date().setFullYear(2025, 0, 1))
    //   });
    // }
  };

  let selectedDate = '';

  if (value) {
    const dateValue = value ? new Date(value * 1000) : new Date();
    const date = dateValue.getDate().toString().padStart(2, '0');
    const month = (dateValue.getMonth() + 1).toString().padStart(2, '0');
    const year = dateValue.getFullYear().toString().padStart(2, '0');
    selectedDate = `${date}/${month}/${year}`;
  }

  return (
    <View style={[{ ...style, height: 51 }]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openDatePicker('date')}
        style={[styles.datecontainer]}
        disabled={readonly}
      >
        {
          (control && name) ?
            <Controller
              control={control}
              name={name}
              rules={rules}
              defaultValue={value ?? Math.floor(Date.now() / 1000)}
              render={({ field: { onChange, value: formValue } }) => {
                return (
                  <TextInput
                    value={formValue}
                    readOnly
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                        color: colors.text,
                        borderColor: error && colors.error,
                        borderWidth: error ? 1 : 0
                        // shadowColor: theme === 'dark' ? colors.primary : undefined,
                      },
                      boxShadow,
                      inputPadding,
                      borderRadius
                    ]}
                    placeholderTextColor={colors.textDarker}
                    placeholder={placeholder}
                  />
                )
              }
              }
            />
            :
            <TextInput
              value={selectedDate}
              readOnly
              style={[
                styles.input,
                {
                  backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                  color: colors.text,
                  borderColor: error && colors.error,
                  borderWidth: error ? 1 : 0
                  // shadowColor: theme === 'dark' ? colors.primary : undefined,
                },
                boxShadow,
                inputPadding,
                borderRadius
              ]}
              placeholderTextColor={colors.textDarker}
              placeholder={placeholder}
            />
        }

        {/* <Icon
          name="calendar"
          size={30}
          color={colors.primary}
          style={[styles.icon]}
        /> */}
      </TouchableOpacity>
      {show && <RNDateTimePicker
        value={new Date(value * 1000)}
        onChange={onDateChange}
        mode='date'
        maximumDate={maxDate ? new Date(maxDate * 1000) : new Date()}
        // minimumDate={new Date()}
        minimumDate={minDate ? minDate : new Date(new Date().setFullYear(new Date().getFullYear(), 0, 1))}

      />}
      {error && <Text style={[{ color: colors.error, fontSize: 13, marginTop: 2 }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderRadius: 16,
    // borderWidth: 1,
    fontSize: 16,
    marginBottom: 2,
    width: '100%',
  },
  datecontainer: {
    flexDirection: 'row',
  },
  icon: {
    zIndex: 100,
    position: 'absolute',
    right: '5%',
    top: '25%',
  },
});

export default React.memo(Datepicker);
