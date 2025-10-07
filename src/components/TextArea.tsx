import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, ViewStyle, Text } from 'react-native';
import { boxShadow } from '../styles/styles';
import { useTheme } from '../theme/ThemeProvider';
import { Controller, Control } from 'react-hook-form';

interface TextAreaProps extends TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  error?: string;
  // RHF props
  control?: Control<any>;
  name?: string;
  rules?: any;
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChangeText,
  placeholder,
  style,
  error,
  control,
  name,
  rules,
  ...props
}) => {
  const { colors } = useTheme();
  return (control && name) ? (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value: ctrlValue, onChange: ctrlOnChange } }) =>
        <View style={[styles.container, style]}>
          <View
            style={[
              boxShadow,
              {
                backgroundColor: '#fff',
                borderWidth: error ? 1 : 0,
                borderColor: error ? colors.error : '',
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: colors.text }]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder={placeholder}
              placeholderTextColor={colors.textLight}
              value={ctrlValue}
              onChangeText={ctrlOnChange}
              {...props}
            />
          </View>
          {error && <Text style={{ color: colors.error, fontSize: 13, marginTop: 2 }}>{error}</Text>}
        </View>
      }
    />
  ) : (
    <View style={[styles.container, style]}>
      <View
        style={[
          boxShadow,
          {
            backgroundColor: '#fff',
            borderWidth: error ? 1 : 0,
            borderColor: error ? colors.error : '',
          },
        ]}
      >
        <TextInput
          style={[styles.textArea, { color: colors.text }]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
      {error && <Text style={{ color: colors.error, fontSize: 13, marginTop: 2 }}>{error}</Text>}
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  textArea: {
    height: 120,
    backgroundColor: 'white',
    fontSize: 16,
    padding: 10,
  },
});

export default TextArea;
