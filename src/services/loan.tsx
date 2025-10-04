import { getLogoutFn } from "../context/AuthContext"
import { responseWrapper } from "../utility/helpers"
import axiosWrapper from "./axiosWrapper"

export const addLoan = async (apiData: any, token?: string) => {
    try {

        const addLoanUrl = 'loan/add'
        const response = await axiosWrapper(token as string).post(addLoanUrl, apiData)
        return responseWrapper(response, "AddLoan")

    } catch (error: any) {
        throw error
    }
}

export const editLoan = async (apiData: any, token?: string) => {
    try {

        const addLoanUrl = 'loan/update'
        const response = await axiosWrapper(token as string).put(addLoanUrl, apiData)
        return responseWrapper(response, "AddLoan")

    } catch (error: any) {
        throw error
    }
}