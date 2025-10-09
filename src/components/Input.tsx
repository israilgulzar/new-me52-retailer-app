import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, boxShadow } from '../styles/styles';
import { calculateEMISchedule, scaleSM } from '../utility/helpers';
import ShowIcon from '../assets/show-icon.svg';

type InputProps = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  keyboardType?: string;
  readonly?: boolean;
  searchPadding?: boolean;
  icon?: boolean;
  formData?: Array<any>;
  phoneNumberPadding?: number;
  onFocus?: () => void;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  inputStyle?: ViewStyle;
  control?: Control<any>;
  name?: string;
  rules?: any;
};

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  style,
  keyboardType,
  readonly,
  searchPadding,
  icon,
  formData,
  phoneNumberPadding,
  maxLength,
  autoCapitalize,
  autoCorrect,
  inputStyle,
  control,
  name,
  rules,
}: InputProps) => {
  const { colors, theme } = useTheme();
  const bottomRef = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => [600], []);
  const [bottomSheetData, setBottomSheetData] = useState<Array<any>>([]);
  const [bottomError, setBottomError] = useState(false);

  const openDrawer = () => {
    setTimeout(() => {
      inputRef.current?.blur();
      Keyboard.dismiss();
    }, 0);

    if (formData) {
      const calculationField = ['actualPrice', 'prepaidPrice', 'installmentType', 'noOfEmis', 'emiDate'];
      const calculationFieldObj: Record<string, any> = {};

      for (let formD of formData) {
        if (formD.component) {
          for (let formDComp of formD.component) {
            if (calculationField.includes(formDComp.key)) calculationFieldObj[formDComp.key] = formDComp.value;
          }
        } else if (calculationField.includes(formD.key)) {
          calculationFieldObj[formD.key] = formD.value;
        }
      }

      let error = Object.keys(calculationFieldObj).length !== calculationField.length;
      for (let key in calculationFieldObj) if (!calculationFieldObj[key]) error = true;

      setBottomError(error);
      if (!error) {
        const calculatedEMISchedule = calculateEMISchedule(
          calculationFieldObj['actualPrice'],
          calculationFieldObj['prepaidPrice'],
          calculationFieldObj['installmentType'],
          calculationFieldObj['noOfEmis'],
          calculationFieldObj['emiDate']
        );
        setBottomSheetData(calculatedEMISchedule.emiDates);
      }
    }

    setTimeout(() => bottomRef.current?.present(), 50);
  };

  const reCalculateScheduleOnChange = (e: string) => {
    onChangeText?.(e);
    setTimeout(() => {
      if (!formData) return;
      const calculationField = ['actualPrice', 'prepaidPrice', 'installmentType', 'noOfEmis', 'emiDate'];
      const calculationFieldObj: Record<string, any> = {};

      for (let formD of formData) {
        if (formD.component) {
          for (let formDComp of formD.component) {
            if (calculationField.includes(formDComp.key)) calculationFieldObj[formDComp.key] = formDComp.value;
          }
        } else if (calculationField.includes(formD.key)) {
          calculationFieldObj[formD.key] = formD.value;
        }
      }

      calculationFieldObj['noOfEmis'] = e;
      let error = Object.keys(calculationFieldObj).length !== calculationField.length;
      for (let key in calculationFieldObj) if (!calculationFieldObj[key]) error = true;

      setBottomError(error);
      if (!error) {
        const calculatedEMISchedule = calculateEMISchedule(
          calculationFieldObj['actualPrice'],
          calculationFieldObj['prepaidPrice'],
          calculationFieldObj['installmentType'],
          calculationFieldObj['noOfEmis'],
          calculationFieldObj['emiDate']
        );
        setBottomSheetData(calculatedEMISchedule.emiDates);
      }
    }, 500);
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  );

  return (
    <KeyboardAvoidingView style={[style]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View>
        {control && name ? (
          <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { value: ctrlValue, onChange: ctrlOnChange } }) => (
              <TextInput
                ref={inputRef}
                value={ctrlValue}
                readOnly={readonly}
                numberOfLines={1}
                onChangeText={(e) => ctrlOnChange(e)}
                placeholder={placeholder}
                placeholderTextColor={theme === 'dark' ? '#BDBDBD' : colors.textDarker}
                secureTextEntry={secureTextEntry}
                maxLength={maxLength}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
                style={[
                  styles.input,
                  boxShadow,
                  borderRadius,
                  {
                    backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                    paddingLeft: searchPadding ? 50 : phoneNumberPadding ? scaleSM(phoneNumberPadding) : 20,
                    color: colors.text,
                    borderColor: error && colors.error,
                    borderWidth: error ? 1 : 0,
                  },
                  inputStyle,
                ]}
                keyboardType={
                  keyboardType === 'email-address'
                    ? 'email-address'
                    : keyboardType === 'number'
                      ? 'numeric'
                      : 'default'
                }
              />
            )}
          />
        ) : (
          <TextInput
            ref={inputRef}
            value={value}
            readOnly={readonly}
            numberOfLines={1}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme === 'dark' ? '#BDBDBD' : colors.textDarker}
            secureTextEntry={secureTextEntry}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            style={[
              styles.input,
              boxShadow,
              borderRadius,
              {
                backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                paddingLeft: searchPadding ? 50 : phoneNumberPadding ? scaleSM(phoneNumberPadding) : 20,
                color: colors.text,
                borderColor: error && colors.error,
                borderWidth: error ? 1 : 0,
              },
              inputStyle,
            ]}
            keyboardType={
              keyboardType === 'email-address'
                ? 'email-address'
                : keyboardType === 'number'
                  ? 'numeric'
                  : 'default'
            }
          />
        )}

        {icon && (
          <View style={{ position: 'absolute', right: '2%', top: '0%', width: 50, height: 50, zIndex: 10, padding: 15 }} pointerEvents="box-none">
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} onPress={openDrawer}>
              <ShowIcon />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}

      <BottomSheetModal ref={bottomRef} index={0} snapPoints={snapPoints} enablePanDownToClose backdropComponent={renderBackdrop}>
        <BottomSheetScrollView style={{ paddingVertical: 15, paddingHorizontal: 20, height: 600 }}>
          <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '600', marginBottom: 40, color: colors.textDark }}>
            EMI Installments
          </Text>
          <Input value={value} onChangeText={reCalculateScheduleOnChange} label="Number of Installment" placeholder="Number of Installment" readonly={readonly} />
          {bottomError ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ color: colors.text, alignSelf: 'center', justifyContent: 'center' }}>
                Please check Actual Price, Down Payment, Installment Type, EMI start date and Number of installment is filled
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 25 }}>
              {bottomSheetData.map((bottomSheetD, index) => (
                <View
                  key={bottomSheetD.date}
                  style={{
                    height: 65,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: '#E1E1E1',
                    borderRadius: 16,
                    marginBottom: 25,
                    paddingRight: 16,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 70, backgroundColor: '#F39314', height: 65, borderTopLeftRadius: 16, borderBottomLeftRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 24 }}>{index + 1}</Text>
                    </View>
                    <View style={{ marginLeft: 20 }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{bottomSheetD.installmentType}</Text>
                      <Text style={{ color: '#8F999E', fontSize: 14 }}>{bottomSheetD.date}</Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.text }}>{bottomSheetD.amount}/-</Text>
                </View>
              ))}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
};

export default React.memo(Input);

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    fontSize: 16,
    marginBottom: 2,
    height: 51,
  },
  error: {
    marginTop: 2,
    fontSize: 13,
  },
});
