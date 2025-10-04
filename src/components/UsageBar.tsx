import React from 'react';
import { View, StyleSheet } from 'react-native';

interface UsageBarProps {
  params1: number;
  params2: number;
}

const UsageBar = ({ params1, params2 }: UsageBarProps) => {
  const total = params1 + params2;

  // safe calculation
  const param1Percentage = total > 0 ? (params1 / total) * 100 : 0;
  const remainingPercent = 100 - param1Percentage;

  return (
    <View style={styles.container}>
      <View style={[styles.used, { width: `${param1Percentage}%` }]} />
      <View style={[styles.remaining, { width: `${remainingPercent}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  used: {
    backgroundColor: '#FF9100', // used
  },
  remaining: {
    backgroundColor: '#FFC476', // remaining
  },
});

export default UsageBar;
