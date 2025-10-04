import axiosWrapper from "./axiosWrapper"

export const getActiveCount = async (id?: string, token?: string) => {
    try {

        const listUrl = `/user/count?parent=${id}`;
        const response = await axiosWrapper(token as string).get(listUrl)
        if (response && response.data && response.data.success == true) {
            return response.data
        } else {
            throw { name: 'getActiveCount', messgae: response.data }
        }

    } catch (error) {
        console.log("error:", error);
        throw error
    }
}