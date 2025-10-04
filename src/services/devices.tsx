import { getLogoutFn } from "../context/AuthContext"
import { responseWrapper } from "../utility/helpers"
import axiosWrapper from "./axiosWrapper"

export const addDevice = async (apiData: any, token?: string) => {
    try {
        const addDeviceUrl = 'device/add'
        const response = await axiosWrapper(token as string).post(addDeviceUrl, apiData)
        return responseWrapper(response, "AddDevice")
    } catch (error: any) {
        throw error
    }
}

export const editDevice = async (apiData: any, token?: string) => {
    try {
        const addDeviceUrl = 'device/update'
        const response = await axiosWrapper(token as string).put(addDeviceUrl, apiData)
        return responseWrapper(response, "AddDevice")
    } catch (error: any) {
        throw error
    }
}

export const blockunblockCommand = async (apiData: any, token?: string) => {
    try {
        const commandUrl = 'device/devicecommand'
        const response = await axiosWrapper(token as string).post(commandUrl, apiData)
        return responseWrapper(response, "Block/Unblock command")
    } catch (error) {
        throw error
    }
}