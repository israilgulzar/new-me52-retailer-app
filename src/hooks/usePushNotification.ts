import {
    getMessaging,
    onMessage,
    onNotificationOpenedApp,
    getInitialNotification
} from "@react-native-firebase/messaging";
import { getApp } from '@react-native-firebase/app';
import { useEffect } from 'react';
import eventBus from "../../eventBus";

const app = getApp();
const messaging = getMessaging(app);

export const usePushNotification = async ({ navigationRef }: { navigationRef?: any }) => {

    const covertToMessage = (notification: any) => {

        if (notification?.data?.title && notification?.data?.description &&
            (notification?.data?.images || (notification?.data?.video && notification?.data?.video_thumbnail))) {

            const message = {
                message: JSON.stringify({
                    title: notification.data.title,
                    description: notification.data.description,
                    ...(notification.data.images?.length ? { images: notification.data.images } : {}),
                    ...(notification.data.video_thumbnail ? { video_thumbnail: notification.data.video_thumbnail } : {}),
                    ...(notification.data.video ? { video: notification.data.video } : {}),
                    ...(notification.data._id ? { _id: notification.data._id } : {}),
                })
            }

            console.log("message:", message);
            console.log("navigationRef:", navigationRef);
            if (navigationRef) {
                navigationRef.navigate('MessageScreen', { message });
            }
        }

    }

    useEffect(() => {

        const listener = (notification: any) => {
            console.log("usePushNotification notification");
            console.log(notification);
            covertToMessage(notification);
        };

        eventBus.on("notification", listener);

        const getMessageLoad = async () => {
            // 2) fallback: check Firebase getInitialNotification (if OS/FCM delivered a initial directly)
            try {
                const remoteMessage: any = await getInitialNotification(messaging);
                console.log('getInitialNotification ->', remoteMessage);
                if (remoteMessage?.data) {
                    covertToMessage(remoteMessage);
                }
            } catch (e) {
                console.warn('getInitialNotification failed', e);
            }
        }

        const unsubOpen = onNotificationOpenedApp(messaging, async (remoteMessage: any) => {
            console.log("onNotificationOpenedApp:", remoteMessage);
            covertToMessage(remoteMessage);
        });

        const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage: any) => {
            console.log("onMessage:", remoteMessage);
            eventBus.emit("sendnotification", remoteMessage);
            // sendPushNotification(remoteMessage);
        });

        getMessageLoad();

        return () => {

            // cleanup duplicate listeners
            if (unsubscribeOnMessage) unsubscribeOnMessage();
            if (unsubOpen) unsubOpen();
            eventBus.off("notification", listener);

        }

    }, [])



};