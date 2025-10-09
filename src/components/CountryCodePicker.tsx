import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Animated,
    Dimensions,
    TextInput,
} from 'react-native';
import { countryCodes } from '../common/countries';
import { darkColors, lightColors } from '../theme';

interface CustomCountryPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (country: { cca2: string; callingCode: string }) => void;
    selectedCountryCode?: string;
}

const { height } = Dimensions.get('window');

const CountryCodePicker = ({
    visible,
    onClose,
    onSelect,
    selectedCountryCode,
}: CustomCountryPickerProps) => {
    const [search, setSearch] = useState('');
    const [slideAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const filteredCountries = countryCodes?.filter(
        (c) =>
            c.key.toLowerCase().includes(search.toLowerCase()) ||
            c.label.includes(search) ||
            c.name.toLowerCase().includes(search.toLowerCase())
    );

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
    });

    const renderItem = ({ item }: any) => {
        const FlagIcon = item.image;
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => {
                    onSelect({ cca2: item.key, callingCode: item.value });
                    onClose();
                }}
            >
                <View style={styles.flagIcon}>
                    <FlagIcon />
                </View>
                <Text style={styles.itemText}>{item?.name}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
            <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
                <View style={styles.header}>
                    <TextInput
                        placeholder="Search country"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>

                {filteredCountries.length > 0 ? (
                    <FlatList
                        data={filteredCountries}
                        keyExtractor={(item) => item.key}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.noResultContainer}>
                        <Text style={styles.noResultText}>No country found</Text>
                    </View>
                )}
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        maxHeight: '70%',
        backgroundColor: lightColors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    header: {
        padding: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc',
    },
    searchInput: {
        backgroundColor: darkColors.text,
        borderRadius: 10,
        padding: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
    },
    flagIcon: {
        width: '15%',
        height: 25,
    },
    itemText: {
        fontSize: 16,
        color: darkColors.black,
    },
    noResultContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultText: {
        fontSize: 16,
        color: darkColors?.black,
    },
});

export default CountryCodePicker;
