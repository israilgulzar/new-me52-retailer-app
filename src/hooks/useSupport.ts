import { useState } from 'react';
import { getSupportList } from '../services/support';

const useSupport = ({
    users,
}: any) => {

    const [supports, setSupports] = useState<any>([]);
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false)

    console.log('====================================');
    console.log("loadingStatus:", loadingStatus);
    console.log('====================================');

    const fetchSupport = async (mounted: boolean) => {
        if (!mounted) return;

        try {
            setLoadingStatus(true);
            const response = await getSupportList(users.token);
            let listData = Array.isArray(response?.data) ? response.data : [];
            console.log("ME52RETAILERTESTING getSupportList", listData?.length);
            setSupports(listData);
            setLoadingStatus(false);
        } catch (error: any) {
            console.log(error);
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setSupports([]); // ensure supports is empty on error
            setLoadingStatus(false);
        }
    }

    return { supports, loadingStatus, fetchSupport };

};

export default useSupport;