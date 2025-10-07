import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { useTheme } from '../theme/ThemeProvider';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import Footer from '../components/Footer';
import NoDataFound from '../components/NoDataFound';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import useNotifications from '../hooks/useNotifications';
import { SCREENS } from '../navigation/screens';
import Loader from '../components/Loader';
import useSocket from "../hooks/useSocket";
import { useFocusEffect, NavigationProp } from '@react-navigation/native';

const Notifications = () => {

  const navigation = useNavigation<NavigationProp<any>>();
  const { socket } = useSocket();

  const {
    notifications,
    loading,
    error,
    loadInitial,
    loadMore,
    markAllAsRead,
  } = useNotifications();
  const { colors } = useTheme();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {

    const onMessage = () => loadInitial()

    socket.on("chatMessage", onMessage);

    return () => {
      socket.off("chatMessage", onMessage);
    };

  }, []);

  // Load first page on mount
  useFocusEffect(
    useCallback(() => {
      loadInitial();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitial(); // reload notifications
    setRefreshing(false);
  };

  const routeToPage = (notification: any) => {
    console.log("routeToPage");
    console.log(notification);

    if (notification?.navigation?.includes('orders')) {
      const items = notification?.navigation?.split('/');
      const orderId = items[items.length - 1];
      if (orderId)
        navigation.navigate(SCREENS.Order, {
          screen: SCREENS.ViewOrder,
          params: { orderId, viewOnly: true },
        });
    } else {
      navigation.navigate(SCREENS.Message, {
        message: { message: JSON.stringify(notification) },
      });
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);

    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  };

  const renderNotificationCard = ({ item }: { item: any }) => {
    const isNew = !item.read;

    const badgeColors = {
      backgroundColor: isNew ? '#F3931444' : '#7CD42B44',
      color: isNew ? '#F39314' : '#2E3B2E',
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{ width: '98%', marginBottom: moderateScale(12), marginHorizontal: '1%' }}
        onPress={() => routeToPage(item)}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: item.read ? '#fff' : '#fff5e9' },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={{ ...styles.title, color: colors.text }}>{item.title}</Text>
            {isNew && (
              <View style={[styles.badge, { backgroundColor: badgeColors.backgroundColor }]}>
                <Text style={[styles.badgeText, { color: badgeColors.color }]}>NEW</Text>
              </View>
            )}
          </View>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
          <Text style={styles.date}>{getRelativeTime(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const RenderFooter = () => {
    return (
      <View >
        {loading ? <Loader /> : null}
        <Footer />
      </View>
    )
  }

  return (
    <CRootContainer style={{ ...commonStyle.flex, ...commonStyle.pb10, ...commonStyle.ph25 }}>
      <CHeader title="Notifications" />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {notifications && notifications.length > 0 && notifications[0].read === false && (
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllAsRead({})}
          >
            <Icon
              name="check-all"
              size={moderateScale(20)}
              color="#fff"
              style={{ marginRight: moderateScale(8) }}
            />
            <Text style={styles.markAllText}>Mark All As Read</Text>
          </TouchableOpacity>
        </View>
      )}


      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={renderNotificationCard}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={RenderFooter}
        ListEmptyComponent={<NoDataFound label="No Notifications Found" />}
        contentContainerStyle={commonStyle.flexGrow1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.darker]}   // Android spinner color
            tintColor={colors.darker} // iOS spinner color 
          />
        }
      />

    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    width: '100%',
    marginBottom: 12,
    display: 'flex',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  markAllButton: {
    flexDirection: 'row',
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F39314',
    paddingVertical: 12,
    borderRadius: 8,
    width: '50%',
    shadowColor: '#F39314',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Notifications;
