import PushNotification from 'react-native-push-notification';

import { getApp } from '@react-native-firebase/app';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import eventBus from "./eventBus";
import { setInitialNotification } from './notificationBuffer';

let LOADED = false

const channelId = 'me52-marketing-messages';

export const setUp = () => {

    if (LOADED)
        return

    LOADED = true

    console.log("NOTIFICATION SETUP");

    const listener = (notification: any) => {

        console.log("PUSHN SEND NOTIFICATION");
        console.log(notification);
        sendPushNotification(notification);

    };

    eventBus.on("sendnotification", listener);

    const sendPushNotification = (remoteMessage: any) => {
        try {

            if (remoteMessage?.data?.title && remoteMessage?.data?.description &&
                (remoteMessage?.data?.images || (remoteMessage?.data?.video && remoteMessage?.data?.video_thumbnail))) {

                const notification: any = {
                    channelId, // must match channel created below
                    title: remoteMessage.data.title,
                    message: remoteMessage.data.description,
                    ...(remoteMessage.data.images?.length ? { picture: JSON.parse(remoteMessage.data.images)[0] } : {}),
                    ...(remoteMessage.data.video_thumbnail ? { picture: remoteMessage.data.video_thumbnail } : {}),
                    ...(remoteMessage.data ? { userInfo: remoteMessage.data } : {}),
                    priority: "high",
                    visibility: "public",

                    
                    // this is working in some of case
                    // bigPictureUrl: "ic_company_logo", // 🟢 Person’s DP
                    // largeIconUrl: "ic_company_logo",  // 🟢 Shown on left side
                    // this is working in some of case


                    smallIcon: "ic_notification", // white bell for status bar
                    largeIcon: "ic_launcher_color", // colored app icon for notification #f39314 tray
                    color: "#ffb87b", // accent color (optional, brand color)
                }

                console.log("notification:", JSON.stringify(notification));

                PushNotification.localNotification(notification);

            }

        } catch (err: any) {
            console.log(err);
        }
    }

    PushNotification.createChannel(
        {
            channelId,
            channelName: "Me52 Company",
            channelDescription: "Me52 Notification",
            playSound: true,
            soundName: "default",
            importance: 4,
            vibrate: true
        },
        (created) => console.log(`🔔 ${channelId} Channel created: ${created}`) // true if created, false if existed
    );

    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function (token) {
            console.log("TOKEN:", token);
        },

        // (required) Called when a remote is received or opened, or local notification is opened
        onNotification: (notification) => {

            console.log(" %%%%%%%%% NOTICING FROM CLICK %%%%%%%%%:", notification);
            eventBus.emit("notification", notification);

        },

        // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
        onAction: function (notification) {
            console.log(")))))))))))ACTION:", notification?.action);
            console.log(")))))))))))NOTIFICATION:", notification);
            // process the action
        },

        // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
        onRegistrationError: function (err) {
            console.error(err.message, err);
        },
        popInitialNotification: true,
        requestPermissions: true,

    });

    PushNotification.popInitialNotification(async (initial: any) => {
        console.log('popInitialNotification ->', initial);
    });

    const app = getApp();
    const messaging = getMessaging(app);

    // MUST be here (top-level)
    setBackgroundMessageHandler(messaging, async (remoteMessage: any) => {

        console.log('📩 [Background/Killed] FCM:', remoteMessage);
        setInitialNotification(covertToMessage(remoteMessage)); // store until React is ready


    });


    const covertToMessage = (notification: any) => {
        const data = notification?.data || {};
        const notif = notification?.notification || {};

        if ((data.title || notif.title) && (data.description || notif.body) &&
            (data.images || data.video || data.video_thumbnail || notif.image)) {

            const message = {
                message: JSON.stringify({
                    title: data.title || notif.title,
                    description: data.description || notif.body,
                    ...(data.images?.length ? { images: data.images } : (notif.image ? { images: notif.image } : {})),
                    ...(data.video_thumbnail ? { video_thumbnail: data.video_thumbnail } : {}),
                    ...(data.video ? { video: data.video } : {}),
                    ...(data._id ? { _id: data._id } : {}),
                })
            };

            console.log("message:", message);
            return message;
        }
    };


}
