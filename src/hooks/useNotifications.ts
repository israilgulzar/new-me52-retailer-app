import { useState, useEffect } from 'react';
import { getMyNotifications, getUnreadCount, makeAsRead } from '../services/notificattions';
import { useAuth } from '../context/AuthContext';

export interface NotificationItem {
    _id: string;
    datetime: string;
    title: string;
    description: string;
    recipient: string;
    device?: string;
    EMI?: string;
    type?: string;
    status?: string;
    navigation?: string;
    read: boolean;
    is_deleted: boolean;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export default function useNotifications() {

    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pageNo, setPageNo] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const { users } = useAuth();
    const PAGE_SIZE = 10;

    // Internal fetch that merges pages
    const fetchNotifications = async (page: number, isRefresh = false) => {
        if (loading) return;
        try {
            setLoading(true);
            const response = await getMyNotifications({ pageno: page, pagesize: PAGE_SIZE, sort: 'createdAt', sortDirection: -1 }, users.token);
            const data: NotificationItem[] = response.data || [];

            if (isRefresh || page === 1) {
                setNotifications(data);
            } else {
                setNotifications(prev => {
                    const ids = new Set(prev.map(n => n._id));
                    return [...prev, ...data.filter(n => !ids.has(n._id))];
                });
            }

            // If less than PAGE_SIZE, no more data
            setHasMore(data.length === PAGE_SIZE);
            setPageNo(page);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    // Public method to load first page (refresh)
    const loadInitial = () => {
        setHasMore(true);
        fetchNotifications(1, true);
    };

    // Public method to load next page
    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = pageNo + 1;
            fetchNotifications(nextPage);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount({}, users.token);
            setUnreadCount(response.data || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };


    const markAllAsRead = async (passData: any) => {
        try {

            const allnotifications = notifications.map((notification: any) => { return { ...notification, read: true } })
            setNotifications([...allnotifications]);
            setUnreadCount(0);
            const response = await makeAsRead(passData, users.token);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        error,
        loadInitial,
        loadMore,
        fetchUnreadCount,
        markAllAsRead
    };
}
