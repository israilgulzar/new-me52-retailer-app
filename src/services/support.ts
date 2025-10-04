import axiosWrapper from "./axiosWrapper"

export const getSupportList = async (token?: string) => {
    try {

        const listUrl = `support/filteredList?is_active=true`;
        const response = await axiosWrapper(token as string).get(listUrl)

        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'getSupportList', messgae: response.data }
        }

    } catch (error) {
        throw error
    }
}