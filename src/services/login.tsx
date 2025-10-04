import axios from "axios"
import axiosWrapper from "./axiosWrapper"
import { API_URL } from "../environment"
import Toast from "react-native-toast-message"
import { onError } from "../utility/Toaster"

interface Login {
    phonenumber: string,
    countryCode: string,
    password: string
}
interface ForgotPassword {
    email: string,
}
interface ResetPassword {
    email: string,
    password: string
    resetCode: number
}

export const loginService = async ({ phonenumber, countryCode, password }: Login) => {
    try {

        console.log('ME52RETAILERTESTING', { phone: phonenumber, phone_country_code: countryCode, password: password, type: "retailer" });

        const response = await axios.post(`${API_URL}user/login`,
            { data: { phone: phonenumber, phone_country_code: countryCode, password: password, type: "retailer" } })

        if (response && response.data.success) {
            return response.data
        } else {
            console.log('ME52RETAILERTESTING', "Response login failed ", response.data)
            return response.data
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while login:- ")
        console.log('ME52RETAILERTESTING', error)
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw error
    }
}

export const getProfile = async (token?: string) => {
    try {

        const url = `${API_URL}user/profile`

        console.log('ME52RETAILERTESTING GET PROFILE', token, url);

        const response = await axiosWrapper(token as string).get(url);

        if (response?.data?.success) {
            return response.data.data
        } else {
            console.log('ME52RETAILERTESTING', "Response get profile failed ", response.data)
            return response.data
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while get profile:- ")
        console.log('ME52RETAILERTESTING', error.response.data)
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw error
    }
}

export const forgotPasswordService = async ({ email }: ForgotPassword) => {
    try {

        console.log('ME52RETAILERTESTING', { email, type: "retailer" });

        const response = await axios.post(`${API_URL}user/forgotPassword`,
            { data: { email, type: "retailer" } })

        if (response && response.data.success) {
            return response.data
        } else {
            console.log('ME52RETAILERTESTING', "Response login failed ", response.data)
            return response.data
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while login:- ")
        console.log('ME52RETAILERTESTING', error)
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw error
    }
}

export const resetPasswordService = async ({ email, resetCode, password }: ResetPassword) => {
    try {

        console.log('ME52RETAILERTESTING', { email, resetCode, password, type: "retailer" });

        const response = await axios.post(`${API_URL}user/resetPassword`,
            { data: { email, resetCode, password, type: "retailer" } })

        if (response && response.data.success) {
            return response.data
        } else {
            console.log('ME52RETAILERTESTING', "Response login failed ", response.data)
            return response.data
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while login:- ")
        console.log('ME52RETAILERTESTING', error.response.data)
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw error
    }
}

export const setPasswordService = async (password: string, token?: string) => {
    try {

        console.log('ME52RETAILERTESTING', { password });

        const response = await axiosWrapper(token as string).put(`${API_URL}user/updatePassword`,
            { data: { password } })

        if (response && response.data.success) {
            return response.data
        } else {
            console.log('ME52RETAILERTESTING', "Response login failed ", response.data)
            return response.data
        }

    } catch (error: any) {
        console.log('ME52RETAILERTESTING', "Error while login:- ")
        console.log('ME52RETAILERTESTING', error.response.data)
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw error
    }
}

export const verifyOTPService = async (email: string, resetCode: string, token?: string) => {
    try {

        const response = await axiosWrapper(token as string).post(`${API_URL}/user/otp`,
            { data: { email, resetCode } })

        if (response && response.data.success) {
            return response.data
        } else {
            return response.data
        }

    } catch (error: any) {
        const message = error.response?.data?.message || "Something when wrong"
        onError("Login", message)
        throw message ?? "Something when wrong"
    }
}