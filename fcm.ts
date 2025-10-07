// fcmService.ts
import { getMessaging, getToken, AuthorizationStatus, requestPermission } from "@react-native-firebase/messaging";
import axios from "axios";
import { getItem2 } from './src/services/asyncStorage';
import { getApp } from '@react-native-firebase/app';
import { API_URL } from "./src/environment"

export async function requestFcmPermission(): Promise<string | null> {
    try {

        const app = getApp();
        const messaging = getMessaging(app);

        const authStatus = await requestPermission(messaging);
        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {

            const fcmToken = await getToken(messaging);

            const storedUserId = await getItem2('USERID');
            console.log("===============> fcmToken", storedUserId, fcmToken);

            const data = {
                _id: storedUserId,
                fcmToken
            }
            await axios.put(API_URL + '/user/updatefcm', { data });
            console.log("===============> fcmToken UPDATED", fcmToken);

            return fcmToken;

        }
        return null;

    } catch (err: any) {

        console.log(err.response.data);
        return null;

    }
}
