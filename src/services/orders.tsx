import { getLogoutFn } from "../context/AuthContext"
import { responseWrapper } from "../utility/helpers"
import axiosWrapper from "./axiosWrapper"

interface listOrderI {
    id?: string,
    pagesize: number,
    pageno: number,
    sort?: string,
    sortDirection?: number
    search?: string
}

interface addOrderI {
    data: {
        keys: Array<{ keytype: string, asked: number, fulfilled: 0 }>,
        type: "buy" | "return"
    }
}

export const getlistOrder = async (apiData: listOrderI, token?: string, filters?: any) => {
    try {
        let listUrl = `order/filteredList?pageno=${apiData.pageno}&pagesize=${apiData.pagesize}`;
        if (apiData.sort) {
            listUrl += `&sort=${apiData.sort}`;
        }
        if (apiData.sortDirection !== undefined) {
            listUrl += `&sortdirection=${apiData.sortDirection}`;
        }
        if (apiData.search) {
            listUrl += `&search=${encodeURIComponent(apiData.search)}`;
        }
        // Updated filter params
        if (filters) {
            // Order Type (status)
            if (filters.type && filters.type !== 'all') {
                listUrl += `&type=${filters.type}`;
            }
            // Order Status (type)
            if (filters.status && filters.status !== 'all') {
                listUrl += `&status=${filters.status}`;
            }
            // Date range
            if (filters.startDate && filters.endDate) {
                listUrl += `&dateRange[]=${encodeURIComponent(filters.startDate)}&dateRange[]=${encodeURIComponent(filters.endDate)}`;
            }
        }
        console.log('ME52RETAILERTESTING', "Order filter is here ", filters, listUrl);
        const response = await axiosWrapper(token as string).get(listUrl);
        if (response && response.data && response.data.success == true) {
            return response.data;
        } else {
            throw { name: 'listOrder', messgae: response.data };
        }
    } catch (error: any) {
        throw error;
    }
}

export const getOrderById = async (id: string, token?: string) => {
    try {

        let getByIdUrl = `order/${id}`
        console.log('ME52RETAILERTESTING', "get Order by Id ", getByIdUrl)

        const response = await axiosWrapper(token as string).get(getByIdUrl)

        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'getOrderById', messgae: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error.response);
        throw error
    }
}

export const getKeyTypes = async (apiData: listOrderI, token?: string) => {
    try {
        const keyTypesUrl = `keytype/filteredList?pageno=${apiData.pageno}&pagesize=${apiData.pagesize}&sort=${apiData.sort}&sortdirection=${apiData.sortDirection}`
        const response = await axiosWrapper(token as string).get(keyTypesUrl)

        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: 'getKeyTypes', message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}

export const addOrder = async (apiData: addOrderI, token?: string) => {
    try {

        const addOrderUrl = 'order/add'
        const response = await axiosWrapper(token as string).post(addOrderUrl, apiData)
        return responseWrapper(response, "AddOrders")

    } catch (error: any) {
        throw error
    }
}

export const updateOrder = async (apiData: addOrderI, token?: string) => {
    try {

        const addOrderUrl = 'order/update'
        const response = await axiosWrapper(token as string).put(addOrderUrl, apiData)
        return responseWrapper(response, "updateOrder")

    } catch (error: any) {
        throw error
    }
}

export const deleteOrder = async (apiData: any, token?: string) => {
    try {
        const deleteOrderUrl = `order/${apiData._id}`
        console.log('ME52RETAILERTESTING', "Calling delet order payload ", apiData, " deleteOrderUrl ", deleteOrderUrl)
        const response = await axiosWrapper(token as string).deleteAxios(deleteOrderUrl)
        console.log('ME52RETAILERTESTING', "Calling user called ", response.data)
        return responseWrapper(response, "DeleteOrder")
    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Delete order error ", error)
        throw error
    }
}