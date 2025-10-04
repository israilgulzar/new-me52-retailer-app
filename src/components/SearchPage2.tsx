import React, { useEffect, useState, } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const SearchPage2 = ({ navigation }) => {



    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Search Users"
                    placeholderTextColor="#888"
                // value={query}
                // onChangeText={handleSearch}
                />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancel}>Cancel</Text>
                </TouchableOpacity>
            </View>

            {/* <FlatList
        data={users}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#FF9800" /> : null}
        contentContainerStyle={{ paddingBottom: 80 }}
      /> */}
        </View>
    );
};

export default SearchPage2;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 10,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    cancel: {
        marginLeft: 10,
        color: '#F57C00',
        fontWeight: '600',
    },
    userCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 1,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 50,
        backgroundColor: '#eee',
    },
    details: {
        marginLeft: 12,
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    info: {
        fontSize: 13,
        color: '#666',
    },
});
