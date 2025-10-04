import React, { useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Card } from './Card';
import Text from './Text';
import Button from './Button';
import { useTheme } from '../theme/ThemeProvider';
import Dot from './Dot';
import CircularChart from './CricularChart';
import { commonStyle } from '../theme';
import { getHeight, moderateScale } from '../common/constants';

import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from "../context/AuthContext"
import { useFocusEffect } from '@react-navigation/native';

interface UserInfoCardProps {
  userName?: string;
  totalAmount: number;
  onUserList: () => void;
  onAddUser: () => void;
  onMyStock?: () => void;
}

export const UserInfoCard = ({
  userName,
  onUserList,
  onAddUser,
}: UserInfoCardProps) => {

  const { users } = useAuth();
  const { activeUsers, fetchActiveCount } = useDashboard({ users });

  useFocusEffect(
    useCallback(() => {
      const mounted = true;
      fetchActiveCount(mounted);
    }, [])
  )

  const { colors } = useTheme();

  return (
    <View style={styles.wrapper}>
      {userName && (
        <Text variant="heading" style={styles.welcome}>
          Welcome Back,{' '}
          <Text style={{ color: colors.primary }}>{userName}</Text>
        </Text>
      )}
      <Card style={styles.card}>
        {/* Top Row */}
        <View >
          <View style={styles.topRow}>
            <View style={styles.usersLabelRow}>
              <Image
                source={require('../assets/user_icon_card.png')}
                style={{ marginRight: moderateScale(6), }}
                resizeMode='contain'
                width={moderateScale(40)}
                height={moderateScale(40)}
              />
              <Text variant="body" style={styles.usersLabel}>
                {'Users'}
              </Text>
            </View>
          </View>
          {/* Middle Grid */}
          <View style={styles.statsRow}>
            {/* First row */}
            <View>
              <View
                style={[
                  styles.dotContainer,
                  commonStyle.mb10,
                  {
                    justifyContent: 'space-between',
                    width: moderateScale(100),
                  },
                ]}
              >
                {/* Active */}
                <View>
                  <View style={[styles.dotContainer]}>
                    <Dot color={colors.mediumOrange} />
                    <Text variant="caption" style={commonStyle.ml10}>
                      {activeUsers}
                    </Text>
                  </View>
                  <Text style={[styles.fontSize10]}>{"Active"}</Text>
                </View>
                {/* Inactive */}
                <View>
                  <View style={styles.dotContainer}>
                    <Dot color={colors.darkerOrange} />
                    <Text variant="caption" style={commonStyle.ml10}>
                      {activeUsers}
                    </Text>
                  </View>
                  <Text style={[styles.fontSize10]}>{"Inactive"}</Text>
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
                      {activeUsers}
                    </Text>
                  </View>
                  <Text style={[styles.fontSize10]}>{"Blocked"}</Text>
                </View>
                {/* Inactive */}
                <View>
                  <View style={[styles.dotContainer]}>
                    <Dot color={colors.mediumOrange} />
                    <Text variant="caption" style={commonStyle.ml10}>
                      {activeUsers}
                    </Text>
                  </View>
                  <Text style={[styles.fontSize10]}>Uninstall</Text>
                </View>
              </View>
              <View style={styles.bottomRow}>
                <Button
                  variant="darker"
                  onPress={onAddUser}
                  title={"Add User"}
                  style={styles.rowButtonStyle}
                  smaller={true}
                />
                <Button
                  variant="outline_darker"
                  onPress={onUserList}
                  title={"User List"}
                  style={styles.rowButtonStyle}
                  smaller={true}
                />
              </View>
            </View>
            <View style={{
              bottom: getHeight(50),
              position: 'absolute',
              right: 0,
            }}>
              <CircularChart
                data={[
                  { value: activeUsers, color: '#EA7600' }, // 47%
                  { value: activeUsers, color: '#FF8F1C' }, // 40%
                  { value: activeUsers, color: '#FFA850' }, // 23%
                  { value: activeUsers, color: '#FFC284' }, // 20%
                ]}
              />
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...commonStyle.itemsCenter,
    ...commonStyle.mt10,
  },
  welcome: {
    textAlign: 'center',
    ...commonStyle.mb10,
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    maxWidth: moderateScale(420),
    ...commonStyle.p15,
    borderRadius: moderateScale(20),
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(8),
    shadowColor: '#000',
    elevation: 2,

  },
  topRow: {
    ...commonStyle.mb15,
    ...commonStyle.rowSpaceBetween,
  },
  usersLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usersLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...commonStyle.mb15,
    gap: moderateScale(4),
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
    marginTop: 2,
    marginBottom: 2,
    fontWeight: '600',
    fontSize: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginVertical: 10,
    width: '100%',
    opacity: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'stretch',
    top: getHeight(20),
    gap: moderateScale(8),

    // right: moderateScale(20),
    // marginBottom: 2,
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
    ...commonStyle.ml5
  },
  fontSize10: {
    fontSize: 10,
  },
  rowButtonStyle: {
    width: '40%',
  },
  rowButtonStyle1: {
    width: '31%',
  }
});
