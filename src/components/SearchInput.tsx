import { useTheme } from "../theme/ThemeProvider";
import { DimensionValue, Image, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import Input from "./Input";
import { width } from "../styles/styles";
import { scaleSM } from "../utility/helpers";
import React, { useEffect, useState } from "react";

interface SearchInputProps {
    onPress?: () => void;
    style?: ViewStyle;
    leftIcon?: boolean;
    placeholder?: string;
    widthP?: DimensionValue;
    onSearchInput: (value: string) => void;
    value: string;
}

const DEBOUNCE_DELAY = 500; // in ms

const SearchInput = ({
    style,
    leftIcon,
    placeholder,
    widthP,
    onSearchInput,
    value,
    onPress
}: SearchInputProps) => {

    const { theme, colors } = useTheme();
    const inputStyle = { ...width };

    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onSearchInput(localValue);
            }
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [localValue]);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <TouchableOpacity
            style={[styles.searchContainer, width, style, { width: widthP }]}
            activeOpacity={1}
            onPress={onPress}
        >
            {leftIcon && (
                <Image
                    source={require("../assets/Search.png")}
                    style={[styles.searchLeftIcon]}
                />
            )}
            <Input
                value={localValue}
                onChangeText={setLocalValue}
                placeholder={placeholder}
                style={inputStyle}
                searchPadding={leftIcon}
            />
            {!leftIcon && (
                <Image
                    source={require("../assets/Search.png")}
                    style={[styles.searchIcon]}
                />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
    },
    searchIcon: {
        position: 'absolute',
        top: '25%',
        right: '5%'
    },
    searchLeftIcon: {
        zIndex: 1000,
        position: 'absolute',
        top: '25%',
        left: '5%'
    }
});

export default React.memo(SearchInput);
