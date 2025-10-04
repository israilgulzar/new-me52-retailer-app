import axiosWrapper from "./axiosWrapper"

export const getScheduledNotificationsCount = async (type?: string, token?: string) => {
    try {

        const response = await axiosWrapper(token as string).get(`schedulednotification/count?status=pending&is_deleted=false&filter_${type}_notification=true`)

        if (response && response.data && response.data.success === true) {
            return response.data
        } else {
            throw { name: 'getKeys', message: response.data }
        }


    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while getting keys ", error)
        throw error
    }
}