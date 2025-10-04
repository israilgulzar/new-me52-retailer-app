import { useState } from 'react';
import { getlistCustomers, deleteCustomerApi, getCustomerCountApi } from '../services/customer';
import { calculateEMISchedule } from '../utility/helpers';
import { onError } from "../utility/Toaster"

const PAGE_SIZE = 10;
type STATUS = "LOADING" | "SUCCESS" | "ERROR" | "NO_DATA" | "MORE_LOADING"

const useFetchCustomer = ({
    search,
    users,
    filters,
}: any) => {

    const [hasMore, setHasMore] = useState<boolean>(true);
    const [customers, setCustomers] = useState<any>([]);
    const [loadingStatus, setLoadingStatus] = useState<STATUS>("LOADING")

    const fetchCustomer = async (pageno: number, mounted: boolean, filter: any = null) => {
        if (!mounted) return;

        try {

            console.log("ME52RETAILERTESTING \n\n\n\n\n\n")

            const currentLoader = pageno > 1 ? 'MORE_LOADING' : 'LOADING';

            console.log(
                "ME52RETAILERTESTING fetchCustomer",
                pageno,
                search,
                filter,
                currentLoader
            );

            setLoadingStatus(currentLoader);

            // 

            const countresponse = await getCustomerCountApi(
                {
                    id: users.id,
                    pageno,
                    pagesize: PAGE_SIZE,
                    search: search.toLowerCase(),
                },
                users.token,
                filter
            )

            let totalCount = countresponse.data;
            console.log("ME52RETAILERTESTING TOTAL COUNT", totalCount)

            const response = await getlistCustomers(
                {
                    id: users.id,
                    pageno,
                    pagesize: PAGE_SIZE,
                    search: search.toLowerCase(),
                },
                users.token,
                filter
            );

            let listData = response?.data?.length ? response.data : [];

            console.log("ME52RETAILERTESTING RESPONSE", listData?.length)

            listData.forEach((user: any) => {
                console.log("USER ID", user?.nameId)

            });


            if (listData?.length) {

                const prevData = pageno === 1 ? [] : customers;
                console.log("ME52RETAILERTESTING EXISTING", prevData?.length)
                console.log("ME52RETAILERTESTING TOTAL", listData.length + prevData.length)
                console.log("HAS MORE", !((listData.length + prevData.length) >= totalCount))

                setHasMore(!((listData.length + prevData.length) >= totalCount));

                listData = listData.map((listD: any) => {
                    const loanDetails = listD?.device?.loan;
                    if (loanDetails) {
                        const calculateSchedule = calculateEMISchedule(
                            loanDetails.actual_price,
                            loanDetails.down_payment,
                            loanDetails.installment_type,
                            loanDetails.no_of_emis,
                            Math.floor(new Date(loanDetails.emi_start_date).setSeconds(19800) / 1000)
                        );
                        if (!calculateSchedule.emiDates[0].date.includes('NaN')) {
                            listD.loan_date = `${calculateSchedule.emiDates[0].date} - ${calculateSchedule.emiDates[calculateSchedule.emiDates.length - 1].date}`;
                        }
                    }
                    return listD;
                });

                console.log("ME52RETAILERTESTING ALL LIST", listData?.length)

                setCustomers((prev: any) => {
                    if (pageno === 1) {
                        return listData; // replace on reset
                    }
                    return [...prev, ...listData]; // append otherwise
                });

                setLoadingStatus('SUCCESS');

            } else {
                setCustomers([]);
                setLoadingStatus('NO_DATA');
            }
        } catch (error: any) {
            console.log(error);
            console.log('Error while fetching customer list', error.response.data);
            setLoadingStatus('SUCCESS');
        }
    }

    const deleteCustomer = async (data: any) => {
        try {

            setLoadingStatus("LOADING")

            const response = await deleteCustomerApi({ _id: data.item._id }, users.token)
            console.log('ME52RETAILERTESTING', "Delete customer response in list customer ", response)
            if (response.success) {
                const prevData = customers.filter((d: any) => d._id !== data.item._id)
                setCustomers([...prevData])
                if (prevData.length !== 0) {
                    setLoadingStatus("SUCCESS")
                } else {
                    setLoadingStatus("NO_DATA")
                }
            } else {
                console.log('ME52RETAILERTESTING', "Fail to delete customer ", response)
            }

            return response;


        } catch (error: any) {
            console.log('ME52RETAILERTESTING', "Error while deleting customer ", error)
            setLoadingStatus("SUCCESS")
            if (error.response?.staus === 400) {
                const message = error.response?.data?.message || 'Some went wrong'
                onError("Customer", message)
            }
        }
    }

    return { hasMore, customers, loadingStatus, fetchCustomer, deleteCustomer, setCustomers };

};

export default useFetchCustomer;