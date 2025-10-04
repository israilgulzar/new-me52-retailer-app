import axiosWrapper from "./axiosWrapper"

export const fetchLedger = async (apiData: any, token?: string) => {
    try {

        let listUrl = `ledger/filteredList?pageno=${apiData.pageno}&pagesize=${apiData.pagesize}&sort=${apiData.sort}&sortdirection=${apiData.sortDirection}`

        if (apiData.search) {
            listUrl += `${listUrl}&search=${apiData.search}`
        }

        const response = await axiosWrapper(token as string).get(listUrl)

        if (response && response.data && response.data.success) {
            return response.data
        } else {
            throw { name: "FetchLedger", message: response.data }
        }

    } catch (error: any) {
        throw error
    }
}