import Toast from "react-native-toast-message"

export const onSuccess = (title: string, message: string) => {
    return Toast.show({
        type: 'success',
        text1: title,
        text2: message,
        position: 'top'
    })
}

export const onError = (title: string, message: string) => {
    return Toast.show({
        type: 'error',
        text1: title,
        text2: message,
        position: 'top'
    })
}

export const onInfo = (title: string, message: string) => {
    return Toast.show({
        type: 'info',
        text1: title,
        text2: message,
        position: 'top'
    })
}