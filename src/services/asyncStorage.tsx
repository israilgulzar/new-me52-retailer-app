import AsyncStorage from "@react-native-async-storage/async-storage"

const setStore = async (key: string, data: any) => {

    try {
        const jsonValue = JSON.stringify(data)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
        throw error
    }
}

const setItem = async (key: string, data: any) => {

    try {
        const jsonValue = data
        await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
        throw error
    }
}

const getItem2 = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? jsonValue : null
    } catch (error) {
        throw error
    }
}
const getItem = async (key: string) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch (error) {
        throw error
    }
}

const removeItem = async (key: string) => {
    try {
        return await AsyncStorage.removeItem(key)
    } catch (error) {
        throw error
    }
}

export {
    setStore,
    getItem,
    removeItem,
    getItem2,
    setItem
}