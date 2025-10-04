import { useState } from 'react';
import { getFaqList } from '../services/faq';

const useFaq = ({
    users,
}: any) => {

    const [faqs, setFaqs] = useState<any>([]);
    const [loadingStatus, setLoadingStatus] = useState<boolean>(false)

    const fetchFaq = async (mounted: boolean) => {
        if (!mounted) return;

        try {
            console.log("ME52RETAILERTESTING fetchFaq");
            setLoadingStatus(true);
            const response = await getFaqList(users.token);
            let listData = Array.isArray(response?.data) ? response.data : [];
            console.log("ME52RETAILERTESTING RESPONSE", listData?.length);
            setFaqs(listData);
            setLoadingStatus(false);
        } catch (error: any) {
            console.log(error);
            if (error?.response?.data) {
                console.log('Error while fetching customer list', error.response.data);
            }
            setFaqs([]);
            setLoadingStatus(false);
        }
    }

    return { faqs, loadingStatus, fetchFaq };

};

export default useFaq;