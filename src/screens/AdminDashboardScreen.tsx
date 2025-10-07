import React, { useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, View, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, ScrollView, Keyboard } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Text from '../components/Text';
import { useNavigation, NavigationProp, CommonActions } from '@react-navigation/native';

import { ImageSlider } from '../components/ImageSlider';
import { UserInfoCard } from '../components/UserInfoCard';
import { KeysInfoCard } from '../components/KeysInfoCard';
import { NotificationInfoCard } from '../components/NotificationInfoCard';
import { FaqSupportCard } from '../components/FaqSupportCard';
import { CustomerStackParamList } from '../navigation/AppNavigator';
import { SCREENS } from '../navigation/screens';
import { useAuth } from '../context/AuthContext';
import { SCREEN_WIDTH } from '../constant';
import Footer from '../components/Footer';
import { MobilType } from '../components/MobileType';
import { NavigatorScreenParams } from '@react-navigation/native';
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import CRootContainer from '../components/CRootContainer';

import { setUp } from "../../pushn";
import { requestFcmPermission } from '../../fcm';
import { usePushNotification } from '../../src/hooks/usePushNotification';
import { setInitialNotification, initialNotification } from '../../notificationBuffer';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.7;
const MENU_ITEMS = [
  { label: 'Profile', icon: 'account' },
  { label: 'Settings', icon: 'cog' },
  { label: 'List of Users', icon: 'account-group' },
];

const DISTRIBUTOR_NAME = 'Distributor Co.';

type RootDrawerParamList = {
  AdminDashboard: undefined;
  FAQ: undefined;
  Support: undefined;
  AddCustomer: undefined;
  ListCustomer: undefined;
  AddOrder: undefined;
  ListOrder: undefined;
  AddNotification: undefined;
  ListNotification: undefined
  Customer: NavigatorScreenParams<CustomerStackParamList>
};

export const AdminDashboardScreen = () => {

  const navigation = useNavigation<NavigationProp<any>>();

  usePushNotification({ navigationRef: navigation });
  setUp();

  const { colors } = useTheme();
  const { users } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("")
  const drawerAnim = useState(new Animated.Value(-DRAWER_WIDTH))[0];

  useEffect(() => {
    requestFcmPermission();
    requestCameraPermission();
  }, []);


  useEffect(() => {
    if (initialNotification) {
      console.log("initialNotification App", initialNotification);
      if (navigation) {
        navigation.navigate('MessageScreen', { message: initialNotification });
      }
      setInitialNotification(null);
    }
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      console.log('ME52RETAILERTESTING', granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      console.log('ME52RETAILERTESTING', true);
    }
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  const onSearchChange = (text: string) => {
    setSearch(text);
  }

  const handleSearchFocus = () => {
    Keyboard.dismiss();
    navigation.navigate(SCREENS.SearchPage);
  };

  const onAndroid = () =>
    navigation.navigate(SCREENS.Customer, {
      screen: SCREENS.AddCustomer
    })


  const onScreenNavigation = (parentScreen: string, screen: string, params?: any) => {
    navigation.navigate(parentScreen, { screen: screen })
    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: parentScreen,
              state: {
                routes: [
                  {
                    name: screen,
                    params
                  }
                ]
              }
            }
          ]
        })
      )
    }, 100)
  }

  return (
    <CRootContainer style={[styles.root]}>
      {/* Navigation Drawer */}
      {drawerOpen && (
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={closeDrawer} />
      )}
      <View style={{ position: 'absolute', backgroundColor: colors.tabColor, width: SCREEN_WIDTH, height: 200, overflow: 'hidden' }}></View>
      <Animated.View style={[styles.drawer, { left: drawerAnim, backgroundColor: colors.card }]}>
        <View style={[styles.drawerHeader]}>
          <Text variant="heading" style={styles.distributor}>{DISTRIBUTOR_NAME}</Text>
        </View>
        <View style={styles.menuList}>
          {MENU_ITEMS.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <Text variant="body">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
      {/* Top Bar */}
      {/* <View style={[styles.topBar, {backgroundColor: colors.card}]}> 
        <TouchableOpacity onPress={openDrawer} style={styles.hamburgerBtn}>
          <View style={[styles.hamburgerLine, {backgroundColor: colors.primary}]} />
          <View style={[styles.hamburgerLine, {backgroundColor: colors.primary}]} />
          <View style={[styles.hamburgerLine, {backgroundColor: colors.primary}]} />
        </TouchableOpacity>
        <View style={styles.centerTitle}>
          <Text variant="heading" style={styles.appTitle}>ME52</Text>
        </View>
        <View style={styles.profileIconWrap}>
          <ProfileIcon size={40} />
        </View>
      </View> */}
      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={commonStyle.ph25} showsVerticalScrollIndicator={false}>
        {/* Image Slider */}
        <ImageSlider />

        {/* commented for now temperoray*/}
        {/* <SearchInput leftIcon={true} value={search} onSearchInput={onSearchChange} placeholder="Search Users..." onPress={handleSearchFocus} /> */}

        {/* User Info Section */}
        <MobilType onAndroid={onAndroid} oniOS={() => { }} />

        <UserInfoCard
          // userName={users.name as string ?? "Admin"}
          totalAmount={123456}
          onUserList={() => onScreenNavigation(SCREENS.Customer, SCREENS.ListCustomer)}
          onAddUser={() => onScreenNavigation(SCREENS.Customer, SCREENS.AddCustomer)}
        />

        <KeysInfoCard
          // userName={users.name as string ?? "Admin"}
          totalAmount={123456}
          onUserList={() => onScreenNavigation(SCREENS.Order, SCREENS.AddEditOrder)}
          onAddUser={() => onScreenNavigation(SCREENS.Order, SCREENS.ListOrder)}
          onMyStock={() => onScreenNavigation(SCREENS.Order, SCREENS.ListKeys)}
        />

        {/* Key Info Section */}
        {/* <KeyInfoCard
          totalAmount={50000}
          stats={{ unused: 120, used: 80, expiral: 10 }}
          onManageKey={() => onScreenNavigation(SCREENS.Order, SCREENS.AddEditOrder)}
          onOrderKey={() => onScreenNavigation(SCREENS.Order, SCREENS.ListOrder)}
          onMyKeys={() => onScreenNavigation(SCREENS.Order, SCREENS.ListKeys)}
        /> */}
        {/* Notification Info Section */}
        <NotificationInfoCard
          onManageNotification={() => onScreenNavigation(SCREENS.Notification, SCREENS.ListNotification)}
          onAddNotification={(params?: any) => onScreenNavigation(SCREENS.Notification, SCREENS.AddEditNotification, params)}
        />
        {/* FAQ & Support Card */}
        <FaqSupportCard
          onFaq={() => navigation.navigate(SCREENS.FAQ as keyof RootDrawerParamList)}
          onSupport={() => navigation.navigate(SCREENS.CustomerSupport as keyof RootDrawerParamList)}
        />
        {/* ...other dashboard content can go here... */}
        <Footer />
      </ScrollView>
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, position: 'relative' },
  topBar: {
    ...commonStyle.rowSpaceBetween,
    paddingHorizontal: moderateScale(12),
    ...commonStyle.pv15,
    elevation: 2,
    borderBottomWidth: moderateScale(1),
  },
  hamburgerBtn: {
    ...commonStyle.p10,
    ...commonStyle.center,
  },
  hamburgerLine: {
    width: moderateScale(28),
    height: moderateScale(3),
    borderRadius: moderateScale(2),
    marginVertical: moderateScale(2),
  },
  centerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  profileIconWrap: {
    marginLeft: moderateScale(8),
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 8,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0006',
    zIndex: 9,
  },
  drawerHeader: {
    alignItems: 'center',
    ...commonStyle.pv25,
    borderBottomWidth: moderateScale(1),
    borderColor: '#FFC10744',
  },
  logo: {
    width: moderateScale(80),
    height: getHeight(80),
    borderRadius: moderateScale(18),
    marginBottom: moderateScale(8),
    backgroundColor: '#FFC10722',
  },
  distributor: {
    fontSize: moderateScale(18),
    color: '#FFC107',
    fontWeight: 'bold',
  },
  menuList: {
    ...commonStyle.mt25
  },
  menuItem: {
    ...commonStyle.pv15,
    ...commonStyle.ph25,
  },
});
