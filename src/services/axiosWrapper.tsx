import axios from "axios";
import { API_URL } from "../environment";
import { getLogoutFn } from "../context/AuthContext";
import { onError } from "../utility/Toaster";

interface FileUploadI {
    file: File;
}

const axiosApi = axios.create({
    baseURL: API_URL,
    timeout: 600000,
});

// 🔹 Interceptors for common error handling
axiosApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            onError("Session Expired", "Please login in");
            const logout = getLogoutFn();
            logout();
        } else if (error.response?.status === 500) {
            const message =
                error.response?.data?.message || "Internal Server Error";
            onError("API error", message);
        }
        return Promise.reject(error);
    }
);

const axiosWrapper = (token: string) => {
    const config = {
        Authorization: token,
    };

    const get = (url: string, options?: any, params?: any) => {
        try {
            options = { ...options, ...config };
            return axiosApi.get(url, {
                headers: options,
                ...(params ? { params } : {}),
            });
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const post = (url: string, data: any, options?: any) => {
        try {
            options = { ...options, ...config };
            console.log("ME52RETAILERTESTING", "Data and url ", data, url);
            return axiosApi.post(url, data, { headers: options });
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const put = (url: string, data: any, options?: any) => {
        try {
            options = { ...options, ...config };
            return axiosApi.put(url, data, { headers: options });
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const deleteAxios = (url: string, options?: any) => {
        try {
            options = { ...options, ...config };
            return axiosApi.delete(url, { headers: options });
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };

    const fileUpload = (url: string, data: any, options?: any) => {
        // const fileSize = data.file.size || data.file.fileSize; // handle both cases
        // const maxSize = 30 * 1024 * 1024; // 30 MB in bytes

        // if (fileSize > maxSize) {
        //     console.log('fileSize > maxSize', fileSize > maxSize, fileSize, maxSize)

        //     Toast.show({
        //         type: "error",
        //         text1: "Upload Failed",
        //         text2: "File size exceeds 30 MB. Please select a smaller video.",
        //     });

        //     return null
        // }

        try {
            const formData = new FormData();
            formData.append("file", {
                uri: data.file.uri,
                type: data.file.type,
                name: data.file.name || data.file.fileName,
            } as any);

            formData.append("filename", data.file.name || data.file.fileName);

            console.log(
                "ME52RETAILERTESTING",
                "Form data is here ",
                formData,
                " url is here ",
                url
            );

            options = {
                ...options,
                ...config,
                "Content-Type": "multipart/form-data",
            };

            const resp = axiosApi.post(url, formData, { headers: options });
            console.log("resp", resp);
            return resp;
        } catch (error: any) {
            handleError(error);
            throw error;
        }
    };


    // 🔹 Reusable error handler
    const handleError = (error: any) => {
        console.log("ME52RETAILERTESTING", "Error occurred", error);

        if (error.response?.status === 401) {
            console.log("ME52RETAILERTESTING", "Calling logout here...");
            const logout = getLogoutFn();
            logout();
        } else if (error.response?.status === 500) {
            const message =
                error.response?.data?.message || "Internal server error";
            onError("Error", message);
        }
    };

    return { get, post, put, deleteAxios, fileUpload };
};

export default axiosWrapper;
