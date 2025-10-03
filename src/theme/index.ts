import {StyleSheet} from 'react-native';
import flex from './flex';
import margin from './margin';
import padding from './padding';
export * from './colors';

// Combine All Styles Here
export const commonStyle = StyleSheet.create({
  ...flex,
  ...margin,
  ...padding,
});
