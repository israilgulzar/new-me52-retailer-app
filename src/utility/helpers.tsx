import { AxiosResponse } from "axios"
import { getCountries, getCountryCallingCode } from "libphonenumber-js"
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform, Alert, Permission } from 'react-native';
import { scale, moderateScale, verticalScale } from "react-native-size-matters"
import { Country } from "country-state-city";
import moment from 'moment-timezone';

export const responseWrapper = (response: AxiosResponse<any, any>, name: string) => {
  if (response && response.data && response.data.success) {
    return response.data
  } else {
    throw { name: name, message: response.data }
  }
}

export const getCountryCodeFromCallCode = (callingCode: string) => {
  const allCountries = getCountries()
  for (let country of allCountries) {
    const code = getCountryCallingCode(country)
    if (code == callingCode) {
      return country
    }
  }
  return null
}

const checkPermission = async (permission: any) => {
  const result = await check(permission);
  if (result === RESULTS.GRANTED) return true;
  if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
    return (await request(permission)) === RESULTS.GRANTED;
  }
  return false;
};

export const requestCamera = async () => {
  const cameraPermission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA
  });

  const cameraGranted = await checkPermission(cameraPermission);

  return cameraGranted;
};

export const isValidIMEI = (imei: string): boolean => {
  if (!/^\d{15}$/.test(imei)) return false

  let sum = 0
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(imei.charAt(i), 10)

    // Double every second digit from the right (i.e., even index from left)
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
  }

  return sum % 10 === 0
}

export const calculateEMISchedule = (
  actualPrice: number,
  downPayment: number,
  installmentType: "daily" | "weekly" | "monthly" | "yearly",
  noOfEMI: number,
  startDate: number
) => {
  const remainingAmount = actualPrice - downPayment;
  const installmentAmount = +(remainingAmount / noOfEMI).toFixed(2);
  const emiDates: Record<string, any>[] = [];

  let currentDate = new Date(startDate * 1000);

  for (let i = 0; i < noOfEMI; i++) {
    let installmentLabel = "";
    switch (installmentType) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1);
        installmentLabel = "Daily";
        break;
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7);
        installmentLabel = "Week";
        break;
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1);
        installmentLabel = "Month";
        break;
      case "yearly":
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        installmentLabel = "Year";
        break;
      default:
        throw new Error("Invalid installment type");
    }

    const dateStr = currentDate;
    const emiDateObj: { date: string, installmentType?: string, amount: number } = {
      date: `${dateStr.getDate().toString().padStart(2, "0")}/${(dateStr.getMonth() + 1).toString().padStart(2, "0")}/${dateStr.getFullYear().toString().padStart(2, "0")}`,
      amount: installmentAmount,
      installmentType: installmentLabel,
    };

    emiDates.push(emiDateObj)
  }

  return {
    remainingAmount,
    installmentAmount,
    emiDates
  };
}



export const dateToString = (datetime: string, sperator: string = "|") => {
  // Parse and convert to IST
  // Format: DD/MM/YYYY | hh:mm am/pm (to match original output)
  return moment(datetime).format(`DD/MM/YYYY ${sperator} hh:mm A`);
}

export const scaleSM = (value: number) => scale(value)
export const moderateScaleSM = (value: number, factor = 0) => moderateScale(value, factor)
export const verticalScaleSM = (value: number) => verticalScale(value)

let country: Array<{ label: string, value: string }> | null = null
export const setCountry = () => {
  if (!country) {
    country = Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode }))
  }
}

export const getCountry = () => {
  return country
}

export function capitalizeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}


