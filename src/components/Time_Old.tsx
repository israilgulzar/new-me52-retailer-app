import RNDateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import React, { useState } from 'react';
import { boxShadow } from '../styles/styles';

interface TimePickerProps {
    value: number;
    error?: string;
    label?: string;
    onChangeText: (value: number) => void;
    style?: ViewStyle;
    readonly?: boolean,
    maxDate?: number,
    placeholder?: string
}

const TimePicker = ({
    value,
    error,
    label,
    onChangeText,
    style,
    readonly,
    maxDate,
    placeholder
}: TimePickerProps) => {
    const [show, setShow] = useState(false)
    const { colors, theme } = useTheme();

    const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'dismissed') {
            setShow(false);
            return;
        }

        if (event.type === 'set') {
            setShow(Platform.OS === 'ios');
            if (event.nativeEvent.timestamp) onChangeText(event.nativeEvent.timestamp / 1000);;
        }
    };

    const openDatePicker = (pickerMode: any) => {
        setShow(true)
    };

    let selectedDate = '';

    if (value) {
        const dateValue = new Date(value * 1000);
        selectedDate = dateValue.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    return (
        <View style={[style, { height: 50 }]}>
            {label && (
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openDatePicker('date')}
                style={[styles.datecontainer]}
                disabled={readonly}
            >
                <TextInput
                    value={selectedDate}
                    readOnly
                    style={[
                        styles.input,
                        boxShadow,
                        {
                            backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
                            color: colors.text,
                            borderColor: error && colors.error,
                            borderWidth: error ? 1 : 0
                            // shadowColor: theme === 'dark' ? colors.primary : undefined,
                        },
                    ]}
                    placeholder={placeholder}
                />
            </TouchableOpacity>
            {show && <RNDateTimePicker
                value={new Date(value * 1000)}
                mode='time'
                display={Platform.OS === "ios" ? "spinner" : 'default'}
                onChange={onTimeChange}
            />}
            {error && <Text style={[{ color: colors.error }]}>{error}</Text>}
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
        borderWidth: 0,
        // padding: 12,
        fontSize: 16,
        // marginBottom: 2,
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

export default React.memo(TimePicker);
