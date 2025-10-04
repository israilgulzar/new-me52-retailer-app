import { responseWrapper } from "../utility/helpers"
import axiosWrapper from "./axiosWrapper"

interface listCustomerI {
    id?: string,
    parent?: string,
    pagesize: number,
    pageno: number,
    sort?: string,
    sortDirection?: number,
    search?: string
    notificationtype?: string
}

interface uploadFileI {
    folderName: string,
    file: File
}

export const getlistCustomer = async (apiData: listCustomerI, token?: string) => {
    try {
        const listUrl = `user/filteredList?parent=${apiData.id}&pageno=${apiData.pageno}&pagesize=${apiData.pagesize}&sort=${apiData.sort}&sortdirection=${apiData.sortDirection}`
        const response = await axiosWrapper(token as string).get(listUrl)

        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'listCustomer', messgae: response.data }
        }
    } catch (error) {
        throw error
    }
}

export const getCustomerCountApi = async (apiData: listCustomerI, token?: string, filter?: any) => {
    try {

        const params: any = filter ? { ...filter } : {};

        if (apiData.search) {
            params['search'] = apiData.search
        }

        console.log("params");
        console.log(params);

        const listUrl = `user/count`

        const response = await axiosWrapper(token as string).get(listUrl, {}, params)

        if (response && response.data) {
            return response.data
        } else {
            throw { name: "ListCustomers", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error?.response?.data ? JSON.stringify(error?.response?.data) : "");
        throw error
    }
}

export const getlistCustomers = async (apiData: listCustomerI, token?: string, filter?: any) => {
    try {


        const params: any = {
            pageno: apiData.pageno,
            pagesize: apiData.pagesize
        }

        if (apiData.search) {
            params['search'] = apiData.search
        }

        const filter_key = [
            { fekey: "country", bekey: "country" },
            { fekey: "state", bekey: "state" },
            { fekey: "city", bekey: "city" },
            { fekey: "pincode", bekey: "pincode" },
            { fekey: "loanByCompany", bekey: "ledger" },
            { fekey: "installmentType", bekey: "installment_type" },
            { fekey: "emiDate", bekey: "emi_start_date" },
            { fekey: "keyType", bekey: "key" }
        ]

        if (filter) {
            if (filter.active) {
                params['is_active'] = filter.active;
            }

            if (filter.inactive) {
                params['is_active'] = false;
            }

            if (filter.locked) {
                params['is_blocked'] = true;
            }

            if (filter.unlocked) {
                params['is_blocked'] = false;
            }
            for (let filter_k of filter_key) {
                if (filter[filter_k['fekey']]) {
                    params[filter_k['bekey']] = filter[filter_k['fekey']]
                }
            }
            if (filter.startDate && filter.endDate) {
                // Use ISO string format for dateRange as required by API
                params['dateRange'] = [
                    new Date(filter.startDate).toISOString(),
                    new Date(filter.endDate).toISOString()
                ];
            }
        }

        const listUrl = `user/list`

        const response = await axiosWrapper(token as string).get(listUrl, {}, params)

        if (response && response.data) {
            return response.data
        } else {
            throw { name: "ListCustomers", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error?.response?.data ? JSON.stringify(error?.response?.data) : "");
        throw error
    }
}

export const getNotificationCustomers = async (apiData: listCustomerI, token?: string, filter?: any) => {
    try {

        const params: any = {
            pageno: apiData.pageno,
            pagesize: apiData.pagesize,
            notificationtype: apiData.notificationtype
        }

        if (apiData.search) {
            params['search'] = apiData.search
        }

        const filter_key = [
            { fekey: "country", bekey: "country" },
            { fekey: "state", bekey: "state" },
            { fekey: "city", bekey: "city" },
            { fekey: "pincode", bekey: "pincode" },
            { fekey: "loanByCompany", bekey: "ledger" },
            { fekey: "installmentType", bekey: "installment_type" },
            { fekey: "emiDate", bekey: "emi_start_date" },
            { fekey: "keyType", bekey: "key" }
        ]

        if (filter) {
            if (filter.active) {
                params['is_active'] = filter.active;
            }

            if (filter.inactive) {
                params['is_active'] = false;
            }

            if (filter.locked) {
                params['is_blocked'] = true;
            }

            if (filter.unlocked) {
                params['is_blocked'] = false;
            }
            for (let filter_k of filter_key) {
                if (filter[filter_k['fekey']]) {
                    params[filter_k['bekey']] = filter[filter_k['fekey']]
                }
            }
            if (filter.startDate && filter.endDate) {
                // Use ISO string format for dateRange as required by API
                params['dateRange'] = [
                    new Date(filter.startDate).toISOString(),
                    new Date(filter.endDate).toISOString()
                ];
            }
        }

        const listUrl = `user/notificationUsers`

        const response = await axiosWrapper(token as string).get(listUrl, {}, params)

        if (response && response.data) {
            return response.data
        } else {
            throw { name: "ListCustomers", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error?.response?.data ? JSON.stringify(error?.response?.data) : "");
        throw error
    }
}

export const uploadCustomerProof = async (apiData: uploadFileI, token?: string) => {
    try {

        const uploadUrl = `file/upload/${apiData.folderName}`;
        const response = await axiosWrapper(token as string).fileUpload(uploadUrl, apiData)

        console.log("response.data");
        console.log(response.data);

        if (response?.data?.success == true) {
            return response.data
        } else {
            throw { name: 'UploadCustomerProof', message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while uploading image ", error.response.data)
        throw error
    }
}

export const addCustomer = async (apiData: any, token?: string) => {
    try {
        const addUrl = 'user/add'
        const response = await axiosWrapper(token as string).post(addUrl, apiData)
        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: 'AddCustomer', message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}

export const editCustomer = async (apiData: any, token?: string) => {
    try {
        const addUrl = 'user/update'
        const response = await axiosWrapper(token as string).put(addUrl, apiData)
        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: 'AddCustomer', message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}

export const deleteCustomerApi = async (apiData: any, token?: string) => {
    try {
        const deleteCustomerUrl = `user/${apiData._id}`
        console.log('ME52RETAILERTESTING', "Calling delet customer payload ", apiData, " deleteCustomerUrl ", deleteCustomerUrl)
        const response = await axiosWrapper(token as string).deleteAxios(deleteCustomerUrl)
        console.log('ME52RETAILERTESTING', "Calling user called ", response.data)
        return responseWrapper(response, "DeleteCustomer")
    } catch (error: any) {
        throw error
    }
}

export const getCustomerDetails = async (apiData: any, token?: string) => {
    try {
        const customerDetailsUrl = `user/customer?customer=${apiData.id}`
        const response = await axiosWrapper(token as string).get(customerDetailsUrl)
        return responseWrapper(response, "GetCustomerDetails")
    } catch (error: any) {
        throw error
    }
}

export const uploadFiles = async (apiData: any, folderName: string, token?: string) => {
    try {
        const uploadUrl = `files/upload?folderName='${folderName}'`
        const response = await axiosWrapper(token as string).fileUpload(uploadUrl, apiData)
        return responseWrapper(response, "UploadFile")
    } catch (error) {
        throw error
    }
}

export const userMe = async (token?: string) => {
    try {
        const profileUrl = `user/me`
        const response = await axiosWrapper(token as string).get(profileUrl)
        return responseWrapper(response, "ProfileData")
    } catch (error) {
        throw error
    }
} 