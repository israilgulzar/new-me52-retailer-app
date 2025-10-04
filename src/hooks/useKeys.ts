// src/hooks/useKeys.ts
import { useEffect, useState } from 'react';
import { getkeys } from '../services/keys';
import { useAuth } from '../context/AuthContext';

export interface KeyTypeDetails {
    _id: string;
    price: number;
    discount: number;
    tax: number;
    name: string;
    free: boolean;
    location_tracking: boolean;
    sim_tracking: boolean;
    emi_notification: boolean;
    marketing_notification: boolean;
    video_notification: boolean;
    image_notification: boolean;
    phone_block: boolean;
    is_deleted: boolean;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface KeyItem {
    _id: string;
    count: number;
    keytype: KeyTypeDetails;
}


export default function useKeys() {

    const [keys, setKeys] = useState<KeyItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { users } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const fetchKeys = async () => {
            try {

                setLoading(true);

                const response = await getkeys(users.token);
                const keys = response.data.filter((key: any) => { return key.count > 0 });

                keys.forEach((key: any) => {
                    console.log("key");
                    console.log(JSON.stringify(key));
                });

                if (isMounted) setKeys(keys);

            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchKeys();

        return () => {
            isMounted = false;
        };
    }, []);

    return { keys, loading, error };
}
