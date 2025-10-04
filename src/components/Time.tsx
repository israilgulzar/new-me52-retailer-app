import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { StyleSheet, Text, TextInput, View, ViewStyle, NativeSyntheticEvent, TextInputKeyPressEventData, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { boxShadow } from "../styles/styles";
import { commonStyle } from "../theme";
import { moderateScale } from "../common/constants";

interface TimePickerProps {
  value: number; // unix seconds
  label?: string;
  onChangeText: (value: number) => void; // unix seconds
  style?: ViewStyle;
  readonly?: boolean;
  placeholder?: string; // ignored here; we show per-field placeholders HH/MM
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const sanitizeDigits = (s: string) =>
  s
    .split("")
    .map((c) => (/[0-9]/.test(c) ? c : /[a-z]/i.test(c) ? "0" : "")) // letters → "0", others removed
    .join("");

export default function TimePicker({
  value,
  label,
  onChangeText,
  style,
  readonly,
}: TimePickerProps) {

  const { colors, theme } = useTheme();
  const [ampm, setAmpm] = useState<string>("AM");
  const [hh, setHh] = useState<string>("");
  const [mm, setMm] = useState<string>("");

  const hhRef = useRef<TextInput>(null);
  const mmRef = useRef<TextInput>(null);

  // Initialize from incoming timestamp
  useEffect(() => {
    if (!value) {
      setHh("");
      setMm("");
      return;
    }
    const d = new Date(value * 1000);
    const h = d.getHours();
    setAmpm(h > 11 ? "PM" : "AM")
    setHh(pad2(h > 11 ? h - 12 : h));
    setMm(pad2(d.getMinutes()));
  }, [value]);

  // Push up when both parts valid
  const emitIfValid = (h: string, m: string, ampmParam: string = ampm) => {
    if (h.length === 2 && m.length === 2) {
      let hourNum = parseInt(h, 10);
      let minNum = parseInt(m, 10);
      if (isNaN(hourNum)) hourNum = 0;
      if (isNaN(minNum)) minNum = 0;
      // Clamp values
      hourNum = Math.max(0, Math.min(hourNum, 11));
      minNum = Math.max(0, Math.min(minNum, 59));

      // Use moment to handle AM/PM conversion
      let time = moment().startOf('day');
      if (ampmParam === 'AM') {
        // 12 AM is 0 hour
        time = time.hour(hourNum === 12 ? 0 : hourNum).minute(minNum);
      } else {
        // 12 PM is 12 hour, 1-11 PM is 13-23
        time = time.hour(hourNum === 12 ? 12 : hourNum + 12).minute(minNum);
      }
      onChangeText(time.unix());
    }
  };

  const handleHoursChange = (text: string) => {
    console.log("handleHoursChange");

    if (readonly) return;
    let digits = sanitizeDigits(text).slice(0, 2);

    // If user types a single digit > 2 as first char, auto-pad "0x"
    if (digits.length === 1) {
      const d0 = parseInt(digits[0], 10);
      if (d0 > 1) {
        const next = `0${d0}`;
        setHh(next);
        // focus minutes
        requestAnimationFrame(() => mmRef.current?.focus());
        emitIfValid(next, mm);
        return;
      }
      // else keep as single digit until next key
      setHh(digits);
      return;
    }

    if (digits.length === 2) {
      let H = parseInt(digits, 10);
      if (isNaN(H)) H = 0;
      if (H > 11) H = 11;
      const next = pad2(H);
      setHh(next);
      // move to minutes automatically once hours complete
      requestAnimationFrame(() => mmRef.current?.focus());
      emitIfValid(next, mm);
      return;
    }

    // empty
    setHh("");
  };

  const handleMinutesChange = (text: string) => {
    console.log("handleMinutesChange");
    if (readonly) return;
    let digits = sanitizeDigits(text).slice(0, 2);

    if (digits.length === 1) {
      const d0 = parseInt(digits[0], 10);
      // if first minute digit > 5, auto-pad "0x"
      if (d0 > 5) {
        const next = `0${d0}`;
        setMm(next);
        emitIfValid(hh, next);
        return;
      }
      setMm(digits);
      return;
    }

    if (digits.length === 2) {
      let M = parseInt(digits, 10);
      if (isNaN(M)) M = 0;
      if (M > 59) M = 59;
      const next = pad2(M);
      setMm(next);
      emitIfValid(hh, next);
      return;
    }

    // empty
    setMm("");
  };

  const onPressAmPm = () => {
    emitIfValid(hh, mm, ampm === "AM" ? "PM" : "AM");
    setAmpm(ampm === "AM" ? "PM" : "AM");
  };

  // Backspace at start of minutes → go back to hours
  const onMinutesKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === "Backspace" && mm.length === 0) {
      hhRef.current?.focus();
    }
  };

  // When hours filled and user presses backspace at start → stay there
  const onHoursKeyPress = (_e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // noop for now; RN numeric keyboards vary in onKeyPress support
  };

  const disabledStyle = readonly ? { opacity: 0.6 } : undefined;

  return (
    <View style={[style, { minHeight: 51 }]}>
      {label ? <Text style={[styles.label, { color: colors.text }]}>{label}</Text> : null}

      <View style={[styles.row, boxShadow, { backgroundColor: theme === "dark" ? "#232323" : "#FFF" }, disabledStyle]}>
        <TextInput
          ref={hhRef}
          value={hh}
          onChangeText={handleHoursChange}
          onKeyPress={onHoursKeyPress}
          editable={!readonly}
          keyboardType="number-pad"
          placeholder="HH"
          maxLength={2}
          style={[styles.part, { color: colors.text }]}
        />
        <Text style={[styles.colon, { color: colors.text }]}>:</Text>
        <TextInput
          ref={mmRef}
          value={mm}
          onChangeText={handleMinutesChange}
          onKeyPress={onMinutesKeyPress}
          editable={!readonly}
          keyboardType="number-pad"
          placeholder="MM"
          maxLength={2}
          style={[styles.part, { color: colors.text }]}
        />
        <TouchableOpacity style={[styles.ampmcontainer, { backgroundColor: colors.borderLighter }]} onPress={onPressAmPm}>
          <Text style={[styles.ampm, { color: colors.text }]}>{ampm}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontWeight: "600",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 0,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    paddingVertical: 3,
    gap: 6,
  },
  part: {
    // flex: 1,
    paddingVertical: 6,
  },
  colon: {
    paddingHorizontal: 4,
  },
  ampmcontainer: {
    flex: 1,
    ...commonStyle.center,
    ...commonStyle.p5,
    borderRadius: moderateScale(8),
  },
  ampm: {
  }
});
