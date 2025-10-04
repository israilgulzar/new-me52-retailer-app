// CircularChart.tsx
import React from 'react';
import { View, Text as RNText } from 'react-native';
import PieChart, { Slice } from 'react-native-pie-chart';
interface Segment {
  value: number;
  color: string;
}

interface CircularChartProps {
  size?: number;
  strokeWidth?: number;
  data: Segment[];
  centerLabel?: string;
}

const CircularChart = ({
  size = 140,
  data,
  centerLabel = '',
}: CircularChartProps) => {

  const total = data.reduce((sum, seg) => sum + seg.value, 0);
  const widthAndHeight = 150;

  const series: Slice[] = data.every(v => v.value === 0) ? [{ color: '#EA7600', value: 1, label: { text: ``, fill: 'white' } }] :
    data.map((d) => {
      return { color: d.color, value: d.value === 0 ? 2 : d.value, label: { text: `${d.value}`, fill: 'white' } }
    })

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>

      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
        cover={{ radius: 0.65, color: '#FFF' }}
        style={[{ borderRadius: 10 }]}
      />
      {/* Center label */}
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <RNText style={{ fontSize: 20, fontWeight: 'bold', color: '#FF830A' }}>
          {centerLabel ? centerLabel : (total ? total : '0')}
        </RNText>
      </View>
    </View>
  );
};

export default CircularChart;
