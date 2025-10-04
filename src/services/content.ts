import axiosWrapper from "./axiosWrapper"

export const getContentList = async (token?: string) => {
    try {

        const listUrl = `content/filteredList?is_active=true`;
        const response = await axiosWrapper(token as string).get(listUrl)

        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'getContentList', messgae: response.data }
        }

    } catch (error) {
        throw error
    }
}