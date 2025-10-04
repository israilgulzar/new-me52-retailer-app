import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextStyle,
  Image,
} from 'react-native';
import { Card } from './Card';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Dot from './Dot';
import Button from './Button';
import CircularChart from './CricularChart';
import KeysDashboard from '../assets/keys icon.svg';
import { scaleSM, verticalScaleSM } from '../utility/helpers';
import { moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

interface KeyInfoCardProps {
  totalAmount: number;
  stats: { unused: number; used: number; expiral: number };
  onManageKey: () => void;
  onOrderKey: () => void;
  onMyKeys: () => void;
}

export const KeyInfoCard = ({
  totalAmount,
  stats,
  onManageKey,
  onOrderKey,
  onMyKeys,
}: KeyInfoCardProps) => {
  const { colors, theme } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Card style={styles.card}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.labelRow}>
            <Image
              source={require('../assets/key_icon_card.png')}
              style={{
                marginRight: moderateScale(6),
                width: moderateScale(40),
                height: moderateScale(40),
              }}
            />
            <Text variant="body" style={styles.label}>
              Keys
            </Text>
          </View>
        </View>
        {/* Middle Grid */}
        <View style={styles.statsRow}>
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.dotContainer,
                {
                  justifyContent: 'space-between',
                  width: moderateScale(100),
                  marginBottom: moderateScale(10),
                },
              ]}
            >
              {/* Active */}
              <View>
                <View style={[styles.dotContainer]}>
                  <Dot color={colors.mediumOrange} />
                  <Text variant="caption" style={commonStyle.ml10}>
                    {stats.used}
                  </Text>
                </View>
                <Text style={[styles.fontSize10]}>Used</Text>
              </View>
              {/* Inactive */}
              <View>
                <View style={[styles.dotContainer]}>
                  <Dot color={colors.darkerOrange} />
                  <Text variant="caption" style={commonStyle.ml10}>
                    {stats.unused}
                  </Text>
                </View>
                <Text style={[styles.fontSize10]}>Unused</Text>
              </View>
            </View>
            <View
              style={[
                styles.dotContainer,
                { justifyContent: 'space-between', width: moderateScale(100) },
              ]}
            >
              {/* Active */}
              <View>
                <View style={[styles.dotContainer]}>
                  <Dot color={colors.mediumOrange} />
                  <Text variant="caption" style={commonStyle.ml10}>
                    {stats.expiral}
                  </Text>
                </View>
                <Text style={[styles.fontSize10]}>Expired</Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <CircularChart
              data={[
                { value: 3760, color: '#EA7600' }, // 47%
                { value: 3200, color: '#FF8F1C' }, // 40%
                { value: 1840, color: '#FFA850' }, // 23%
              ]}
            />
          </View>
        </View>

        {/* Bottom Grid */}
        <View style={styles.bottomRow}>
          <Button
            variant="darker"
            onPress={onOrderKey}
            title="Manage"
            style={{ flex: 1 }}
            smaller={true}
          />
          <Button
            variant="outline_darker"
            onPress={onManageKey}
            title="Order Keys"
            style={{ flex: 1 }}
            smaller={true}
          />

          <Button
            variant="darker"
            onPress={onMyKeys}
            title="My Stock"
            style={{ flex: 1 }}
            smaller={true}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    ...commonStyle.mv5,
    alignItems: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    ...commonStyle.p20,
    borderRadius: moderateScale(20),
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...commonStyle.mb15,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...commonStyle.mb15,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    ...commonStyle.mh5,
    ...commonStyle.pt10,
    ...commonStyle.pb2,
    borderRadius: moderateScale(12),
    borderWidth: 1.5,
    minWidth: moderateScale(90),
    backgroundColor: '#FFF8E1',
  },
  statLabel: {
    ...commonStyle.pb2,
    ...commonStyle.mb2,
    ...commonStyle.mt2,
    fontWeight: '600',
    fontSize: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    ...commonStyle.mt2,
  },
  separator: {
    height: moderateScale(1),
    ...commonStyle.mv10,
    width: '100%',
    opacity: 0.5,
  },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    gap: moderateScale(2),
  },
  bottomBtn: {
    paddingTop: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  bottomAction: {
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
    minWidth: 70,
  },
  link: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    alignSelf: 'center',
    minWidth: 70,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA000',
    opacity: 0.6,
  },
  dotContainer: {
    flexDirection: 'row',
  },
  fontSize10: {
    fontSize: 10,
  },
});
