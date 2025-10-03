import Config from "react-native-config";

type TENV = 'dev' | 'test' | 'prod';

export const ENV: TENV = (Config.ENV as TENV) ?? "prod";
export const BASE_URL = `${ENV === 'prod' ? '' : ENV + '-'}service.me52company.com`
export const SOCKET_URL = `https://${BASE_URL}`
export const API_URL = `${SOCKET_URL}/api/v1/`
export const IMAGE_BASE_URL = `${API_URL}file/showContent/`

const scannerItem: any = {
    dev: 'https://dev-customer-apk.me52company.com/me52customerapp.apk',
    test: 'https://test-customer-apk.me52company.com/me52customerapp.apk',
    prod: 'https://customer-apk.me52company.com/me52customerapp.apk'
}

export const DOWNLOAD_APK_SCANNER = scannerItem[ENV];