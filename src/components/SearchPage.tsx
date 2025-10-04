import React, { useEffect, useState, } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import SearchPage2 from './SearchPage2';


const API_URL = 'https://your-domain.com/api/v1/user/customer'; // replace with full URL
const API_KEY = '687358248d68d83e8b2fe122';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();

  const api = axios.create({
    baseURL: 'https://your-api-url.com',
    headers: {
      Authorization: 'Bearer 687358248d68d83e8b2fe122',
    },
  });

  const fetchUsers = async (searchTerm = '', pageNumber = 1) => {
    if (!hasMore && pageNumber !== 1) return;
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}?page=${pageNumber}&limit=10&search=${searchTerm}`, {
        headers: {
          Authorization: API_KEY
        }
      });
      const data = response.data.data || response.data; // adapt as per API
      if (pageNumber === 1) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }
      if (data.length < 10) setHasMore(false);
      setLoading(false);
    } catch (error) {
      console.error("ME52RETAILERTESTING", 'API error:', error);
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    setPage(1);
    setHasMore(true);
    fetchUsers(text, 1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(query, nextPage);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => navigation.navigate('SearchPage2', { user: item })}
    >
      <Image source={{ uri: item.image || 'https://via.placeholder.com/40' }} style={styles.avatar} />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>📞 {item.mobile}</Text>
        <Text style={styles.info}>ID: {item.userId}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search Users"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* List of Users */}
      <FlatList
        data={users}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#FF9800" /> : null}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
};

export default SearchPage;

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
