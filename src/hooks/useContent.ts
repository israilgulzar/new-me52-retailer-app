import { useState } from 'react';
import { getContentList } from '../services/content';
import { IMAGE_BASE_URL } from '../environment';

const useContent = ({
    users,
}: any) => {

    const [contents, setContents] = useState<any>([]);
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false)

    const fetchContent = async (mounted: boolean) => {
        if (!mounted) return;

        try {

            setLoadingStatus(true);

            const response = await getContentList(
                users.token
            )

            let listData = response?.data?.length ? response.data.map((item: any) => { item.uri = IMAGE_BASE_URL + item.image; return item }) : [];

            console.log("ME52RETAILERTESTING RESPONSE", listData?.length)

            setContents(listData);

            setLoadingStatus(false);

        } catch (error: any) {
            console.log(error);
            console.log('Error while fetching customer list', error.response.data);
            setLoadingStatus(false);
        }
    }

    return { contents, loadingStatus, fetchContent };

};

export default useContent;