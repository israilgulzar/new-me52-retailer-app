import axiosWrapper from "./axiosWrapper"

export const getkeysCount = async (type?: string, token?: string) => {
    try {

        const response = await axiosWrapper(token as string).get(`key/count?status=${type}`)

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

export const getkeys = async (token?: string) => {
    try {

        const response = await axiosWrapper(token as string).get('key/availibility')

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

export const keyLink = async (apiData: { user: string, keytype: string }, token?: string) => {
    try {

        const response = await axiosWrapper(token as string).put('/key/link', { data: apiData })
        if (response && response.data && response.data.success === true) {
            return response.data
        } else {
            throw { name: 'keyLink', message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}