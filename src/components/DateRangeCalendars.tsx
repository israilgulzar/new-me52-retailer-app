import { useTheme } from '../theme/ThemeProvider';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { boxShadow } from '../styles/styles';
import Button from './Button';
import DateRange from "../assets/date-range.svg"

interface DateRangeInputProps {
  value: {
    startDate?: string,
    endDate?: string
  },
  onChangeText: (value: any, key: string) => void
  placeholder?: string
}

const DateRangeInput = ({ value, onChangeText, placeholder }: DateRangeInputProps) => {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const { colors } = useTheme()

  useEffect(() => {
    setStartDate(value.startDate as string)
    setEndDate(value.endDate as string)
    const range = getDateRange(value.startDate as string, value.endDate as string);
    const marked: any = {};

    range.forEach((date, i) => {
      if (i === 0) {
        marked[date] = {
          startingDay: true,
          color: colors.textDark,
          textColor: 'white',
        };
      } else if (i === range.length - 1) {
        marked[date] = {
          endingDay: true,
          color: colors.textDark,
          textColor: 'white',
        };
      } else {
        marked[date] = {
          color: colors.textDarker,
          textColor: 'white',
        };
      }
    });

    setMarkedDates(marked);
  }, [value])

  const onDayPress = (day: any) => {
    const selected = day.dateString;

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      setMarkedDates({
        [selected]: {
          startingDay: true,
          color: colors.textDark,
          textColor: 'white',
        },
      });
    } else if (!endDate) {
      if (selected < startDate) {
        setStartDate(selected);
        setMarkedDates({
          [selected]: {
            startingDay: true,
            color: colors.textDark,
            textColor: 'white',
          },
        });
      } else {
        setEndDate(selected);
        const range = getDateRange(startDate, selected);
        const marked: any = {};

        range.forEach((date, i) => {
          if (i === 0) {
            marked[date] = {
              startingDay: true,
              color: colors.textDark,
              textColor: 'white',
            };
          } else if (i === range.length - 1) {
            marked[date] = {
              endingDay: true,
              color: colors.textDark,
              textColor: 'white',
            };
          } else {
            marked[date] = {
              color: colors.textDarker,
              textColor: 'white',
            };
          }
        });

        setMarkedDates(marked);
        onChangeText({ startDate: startDate, endDate: selected }, "startEndRange")
        // Close modal after delay
        setTimeout(() => {
          setShowPicker(false);
        }, 300);
      }
    }
  };

  const getDateRange = (start: string, end: string) => {
    const range = [];
    let current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      range.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return range;
  };

  const displayValue = startDate && endDate
    ? `${startDate} to ${endDate}`
    : startDate
      ? `${startDate} to ...`
      : '';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Select Date Range</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.inputWrapper}
        activeOpacity={0.9}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          style={[styles.input, boxShadow, { color: colors.text, backgroundColor: "#fff" }]}
          value={displayValue}
          editable={false}
          pointerEvents="none"
        />
        <View style={{ position: 'absolute', top: 15, right: 15 }}>
          <DateRange />
        </View>
      </TouchableOpacity>

      {/* Date Range Picker Modal */}
      <Modal visible={showPicker} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Pick a Date Range</Text>
          <Calendar
            markingType={'period'}
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              selectedDayBackgroundColor: colors.textDarker,
              todayTextColor: colors.orange,
              arrowColor: colors.textDarker,
            }}
          />
          <View style={{ justifyContent: 'center', width: "100%", alignItems: 'center' }}>
            <Button variant='darker' title='Close' onPress={() => setShowPicker(false)} />
          </View>
          {/* <TouchableOpacity
            onPress={() => setShowPicker(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity> */}
        </View>
      </Modal>
    </View>
  );
};

export default DateRangeInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 60,
    // paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  inputWrapper: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 6,
    // paddingVertical: 12,
  },
  input: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
    height: 51
  },
  modalContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
