import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NotificationIconSvg from '../assets/inscreen_notification.svg';
import { scaleSM, verticalScaleSM } from '../utility/helpers';
import useSocket from "../hooks/useSocket";
import useNotifications from "../hooks/useNotifications";
import { useCallback, useEffect } from 'react';
import { SCREENS } from '../navigation/screens';

import { useNavigation } from '@react-navigation/core';
import { useFocusEffect, NavigationProp } from '@react-navigation/native';

const NotificationIcon = () => {

    const navigation = useNavigation<NavigationProp<any>>();
    const { socket } = useSocket();
    const { unreadCount, fetchUnreadCount } = useNotifications();

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();
        }, [])
    )

    useEffect(() => {

        const onMessage = (msg: any) => {
            console.log("REFRESH NOTIFICATION BELL");
            fetchUnreadCount();
        };

        socket.on("chatMessage", onMessage);

        return () => {
            socket.off("chatMessage", onMessage);
        };

    }, []);

    const goToList = () => {
        navigation.navigate(SCREENS.Notification, { screen: SCREENS.Notifications })
    }

    return (
        <TouchableOpacity onPress={goToList}>
            <View>

                <NotificationIconSvg
                    width={scaleSM(30)}
                    height={verticalScaleSM(30)}
                />

                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 9 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}

            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
});


export default NotificationIcon