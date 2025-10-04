import { useState } from 'react';
import { getActiveCount } from '../services/user';
import { getkeysCount } from '../services/keys';
import { getScheduledNotificationsCount } from '../services/scheduledNotification';

export const useDashboard = ({
    users,
}: any) => {

    const [activeUsers, setActiveUsers] = useState<number>(0);

    const [imageNotificationCount, setImageNotificationCount] = useState<number>(0);
    const [videoNotificationCount, setVideoNotificationCount] = useState<number>(0);

    const [expiredKeysCount, setExpiredKeysCount] = useState<number>(0);
    const [usedKeysCount, setUsedKeysCount] = useState<number>(0);
    const [unusedKeysCount, setUnusedKeysCount] = useState<number>(0);

    const [loadingStatus, setLoadingStatus] = useState<boolean>(false)

    const fetchActiveCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD ACTIVE USERS COUNT:", mounted);
            console.log('====================================');

            setLoadingStatus(true);
            const response = await getActiveCount(users.id, users.token);
            console.log("ME52RETAILERTESTING fetchActiveCount", response);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setActiveUsers(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    const fetchUsedKeysCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD USED KEY COUNT:");
            console.log('====================================');
            setLoadingStatus(true);
            const response = await getkeysCount("used", users.token);
            console.log("ME52RETAILERTESTING fetchUsedKeysCount", response);
            setUsedKeysCount(response.data);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setUsedKeysCount(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    const fetchUnusedKeysCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD UNUNSED KEY COUNT:");
            console.log('====================================');

            setLoadingStatus(true);
            const response = await getkeysCount("unused", users.token);
            console.log("ME52RETAILERTESTING fetchUnusedKeysCount", response);
            setUnusedKeysCount(response.data);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setUnusedKeysCount(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    const fetchExpiredKeysCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD EXPIRED KEY COUNT:", users.id);
            console.log('====================================');

            setLoadingStatus(true);
            const response = await getkeysCount("expired", users.token);
            console.log("ME52RETAILERTESTING fetchUnusedKeysCount", response);
            setExpiredKeysCount(response.data);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setExpiredKeysCount(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    const fetchImageNotificationsCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD EXPIRED KEY COUNT:", users.id);
            console.log('====================================');

            setLoadingStatus(true);
            const response = await getScheduledNotificationsCount("image", users.token);
            console.log("ME52RETAILERTESTING fetchImageNotificationsCount", response);
            setImageNotificationCount(response.data);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setImageNotificationCount(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    const fetchVideoNotificationsCount = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            console.log('====================================');
            console.log("DASHBOARD EXPIRED KEY COUNT:", users.id);
            console.log('====================================');

            setLoadingStatus(true);
            const response = await getScheduledNotificationsCount("video", users.token);
            console.log("ME52RETAILERTESTING fetchVideoNotificationsCount", response);
            setVideoNotificationCount(response.data);
            setLoadingStatus(false);

        } catch (error: any) {
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setVideoNotificationCount(0); // ensure supports is empty on error
            setLoadingStatus(false);

        }
    }

    return {
        loadingStatus,
        activeUsers,
        fetchActiveCount,
        usedKeysCount,
        fetchUsedKeysCount,
        unusedKeysCount,
        fetchUnusedKeysCount,
        expiredKeysCount,
        fetchExpiredKeysCount,
        imageNotificationCount,
        fetchImageNotificationsCount,
        videoNotificationCount,
        fetchVideoNotificationsCount
    };

};