import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, FlatList, Text } from 'react-native';
import SearchInput from '../components/SearchInput';

const SearchScreen = () => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const onSearch = async (query: string) => {
        setSearch(query);
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setResults([`Result for "${query}"`, "User A", "User B"]);
            setLoading(false);
        }, 1500);
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <SearchInput
                leftIcon={true}
                value={search}
                onSearchInput={onSearch}
                placeholder="Type to search..."
            />
            {loading ? (
                <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <Text style={{ padding: 10 }}>{item}</Text>}
                />
            )}
        </View>
    );
};

export default SearchScreen;
