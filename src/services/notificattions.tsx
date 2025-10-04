import { getLogoutFn } from "../context/AuthContext"
import axiosWrapper from "./axiosWrapper"

interface uploadFileI {
    file: File
}

export const addNotificationService = async (apiData: any, token?: string) => {
    try {

        const addUrl = "schedulednotification/add"
        const response = await axiosWrapper(token as any).post(addUrl, { data: apiData })

        console.log('ME52RETAILERTESTING', "addNotificationService");
        console.log('ME52RETAILERTESTING', response);
        console.log('ME52RETAILERTESTING', { addUrl, apiData });

        if (response?.data?.success) {
            return response.data
        } else {
            throw { name: "AddNotification", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error?.response?.data)
        throw error
    }
}

export const updateNotificationService = async (apiData: any, token?: string) => {
    try {

        const addUrl = "schedulednotification/update"
        const response = await axiosWrapper(token as any).put(addUrl, { data: apiData })

        console.log('ME52RETAILERTESTING', "updateNotificationService");
        console.log('ME52RETAILERTESTING', { addUrl, apiData });

        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: "UpdateNotificationService", message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}

export const getNotifications = async (apiData: any, token?: string, applyf?: any) => {
    try {

        console.log('ME52RETAILERTESTING', "getNotifications apiData");
        console.log('ME52RETAILERTESTING', apiData);

        let listUrl = `schedulednotification/filteredList?pageno=${apiData.pageno}&pagesize=${apiData.pagesize}&sort=${apiData.sort}&sortdirection=${apiData.sortDirection}`

        if (apiData.search) {
            listUrl = `${listUrl}&search=${apiData.search}`
        }

        if (apiData.status) {
            listUrl = `${listUrl}&status=${apiData.status}`
        }

        if (apiData.filter_image_notification) {
            listUrl = `${listUrl}&filter_image_notification=${apiData.filter_image_notification}`
        }

        if (apiData.filter_video_notification) {
            listUrl = `${listUrl}&filter_video_notification=${apiData.filter_video_notification}`
        }

        const response = await axiosWrapper(token as string).get(listUrl)


        return response.data

    } catch (error: any) {
        throw error
    }
}

export const getMyNotifications = async (apiData: any, token?: string, applyf?: any) => {
    try {

        console.log('getMyNotifications', "getNotifications apiData");
        console.log('getMyNotifications', apiData);

        let listUrl = `notification/filteredList?pageno=${apiData.pageno}&pagesize=${apiData.pagesize}&sort=${apiData.sort}&sortdirection=${apiData.sortDirection}`
        const response = await axiosWrapper(token as string).get(listUrl)
        return response.data

    } catch (error: any) {
        console.log('ERROR getMyNotifications', error?.response);
        throw error
    }
}

export const getUnreadCount = async (apiData: any, token?: string, applyf?: any) => {
    try {

        console.log('Get Unread Count', "getUnreadCount apiData");
        console.log('Get Unread Count', apiData);

        let listUrl = `notification/count?read=false`

        const response = await axiosWrapper(token as string).get(listUrl)

        console.log('Get Unread Count', "response");
        console.log('Get Unread Count', response?.data);

        return response.data

    } catch (error: any) {
        throw error
    }
}

export const getNotificationById = async (id: string, token?: string) => {
    try {

        let getByIdUrl = `schedulednotification/${id}`
        console.log('ME52RETAILERTESTING', "get schedulednotification by Id ", getByIdUrl)

        const response = await axiosWrapper(token as string).get(getByIdUrl)

        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'getNotificationById', messgae: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error.response);
        throw error
    }
}

export const uploadVideoMedia = async (apiData: uploadFileI, token?: string) => {
    try {

        const uploadUrl = '/file/upload/videoNotification'
        const response = await axiosWrapper(token as string).fileUpload(uploadUrl, apiData)

        console.log('ME52RETAILERTESTING', "Upload Noti Media RESPONSE");
        console.log('ME52RETAILERTESTING', response?.data);

        if (response?.data?.success) {
            return response.data
        } else {
            throw { name: "uploadNotiMedia", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error)
        console.log('ME52RETAILERTESTING', error?.data)
        console.log('ME52RETAILERTESTING', error?.response)
        console.log('ME52RETAILERTESTING', "Error while uploading NotiMedia ", error)
        throw error
    }
}

export const uploadImageMedia = async (apiData: uploadFileI, token?: string) => {
    try {

        const uploadUrl = '/file/upload/imageNotification'
        const response = await axiosWrapper(token as string).fileUpload(uploadUrl, apiData)

        return response

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while uploading NotiMedia ", error)
        throw error
    }
}

export const deleteNotification = async (apiData: any, token?: string, applyf?: any) => {
    try {

        console.log('ME52RETAILERTESTING', "deleteNotification apiData");

        let listUrl = `schedulednotification/${apiData._id}`

        console.log('ME52RETAILERTESTING', { listUrl });

        const response = await axiosWrapper(token as string).deleteAxios(listUrl)

        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: "ListNotification", message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}


export const makeAsRead = async (apiData: any, token?: string) => {

    try {

        let listUrl = `notification/makeasread`

        const response = await axiosWrapper(token as string).post(listUrl, { data: apiData })

        if (response?.data?.success) {
            return response.data
        } else {
            throw { name: "AddNotification", message: response.data }
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', error?.response?.data)
        throw error
    }

}