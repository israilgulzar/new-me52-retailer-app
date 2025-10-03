import { Dimensions, Platform, StatusBar } from 'react-native';

export const screenFullHeight = Dimensions.get('window').height;
export const screenWidth = Dimensions.get('window').width;
export const isAndroid = Platform.OS !== 'ios';

// iPhoneX/XS/11Pro/12/13/14/15 (and similar) detection
const X_HEIGHTS = [812, 844, 896, 926, 932, 852, 780, 800, 1180, 1179];
const X_WIDTHS = [375, 390, 414, 428, 393];
const { height: wHeight, width: wWidth } = Dimensions.get('window');
export const iPhoneX =
  Platform.OS === 'ios' &&
  ((X_HEIGHTS.includes(wHeight) && X_WIDTHS.includes(wWidth)) ||
    (X_HEIGHTS.includes(wWidth) && X_WIDTHS.includes(wHeight)));

export const STATUSBAR_HEIGHT =
  Platform.OS === 'ios' ? (iPhoneX ? 44 : 22) : StatusBar.currentHeight || 0;
export const screenHeight = screenFullHeight - STATUSBAR_HEIGHT;

const sampleHeight = 844;
const sampleWidth = 390;

export const isShowLog = true;

//Get Width of Screen
export function getWidth(value: number): number {
  return (value / sampleWidth) * screenWidth;
}

//Get Height of Screen
export function getHeight(value: number): number {
  return (value / sampleHeight) * screenHeight;
}
const scale = (size: number): number => (screenWidth / sampleWidth) * size;

// Moderate Scale Function
export function moderateScale(size: number, factor: number = 0.5): number {
  return size + (scale(size) - size) * factor;
}
