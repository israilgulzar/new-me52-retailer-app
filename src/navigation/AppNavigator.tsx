import React, { useEffect, useState } from 'react';
import {
	CommonActions,
	NavigationContainer,
	NavigatorScreenParams,
	useTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';

import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ResetPassword } from '../screens/ResetPassword';
import { SetPassword } from '../screens/SetPassword';

import AddCustomerScreen from '../screens/AddEditCustomerScreen';
import BarCodeScanner from '../components/Barcode';
import { getLogoutFn, useAuth } from '../context/AuthContext';
import { getItem } from '../services/asyncStorage';
import ListCustomer from '../screens/ListCustomerScreen';
import ListOrder from '../screens/ListOrder';
import ListKeys from '../screens/ListKeys';
import AddEditOrder from '../screens/AddEditOrder';
import Notifications from '../screens/Notifications';

import AddEditNotification from '../screens/AddEditNotification';
import { Image, View, NativeModules } from 'react-native';
import ListNotification from '../screens/ListNotifications';
import { scaleSM, verticalScaleSM } from '../utility/helpers';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import RippleSplash from '../components/SplashScreen';
import ViewOrder from '../screens/ViewOrder';
import ScannerScreen from '../screens/ScannerScreen';

import SearchPage from '../components/SearchPage';
import FAQScreen from '../components/FAQScreen';
import CustomerSupport from '../components/CustomerSupport';
import SearchPage2 from '../components/SearchPage2';
import MessageScreen from '../screens/MessageScreen';

import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { OTPVerification } from '../screens/OTPVerification';
import { lightColors } from '../theme/colors';

import { HeaderRight } from './HeaderRight';
import { SCREENS } from './screens';
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

export type CustomerStackParamList = {
	AddCustomer: { customerId: string };
	ListCustomer: undefined;
	Barcode: undefined;
};

export type OrderStackParamList = {
	AddOrder: { orderId?: string; viewOnly?: boolean; type?: string };
	ListOrder: undefined;
	ListKeys: undefined;
	ViewOrder: { orderId: any };
};

export type NotificationStackParamList = {
	AddNotification: { notificationId?: string };
	ListNotification: undefined;
};

export type TabParamList = {
	Customer: NavigatorScreenParams<CustomerStackParamList>;
	Order: NavigatorScreenParams<OrderStackParamList>;
	Notification: NavigatorScreenParams<NotificationStackParamList>;
	AdminDashboard: undefined;
	Scanner: undefined;
	FAQ: undefined;
};

const Stack = createNativeStackNavigator();
const CustomerStackNav = createNativeStackNavigator<CustomerStackParamList>();
const OrderStackNav = createNativeStackNavigator<OrderStackParamList>();
const NotificationStackNav =
	createNativeStackNavigator<NotificationStackParamList>();
const Tab = createBottomTabNavigator();

const CustomerStack = () => {
	return (
		// <CountryProvider>
		<CustomerStackNav.Navigator
			initialRouteName={SCREENS.ListCustomer as keyof CustomerStackParamList}
			screenOptions={{ headerShown: false }}
		>
			<CustomerStackNav.Screen
				name={SCREENS.ListCustomer as keyof CustomerStackParamList}
				component={ListCustomer}
			></CustomerStackNav.Screen>
			<CustomerStackNav.Screen
				name={SCREENS.AddCustomer as keyof CustomerStackParamList}
				component={AddCustomerScreen}
			></CustomerStackNav.Screen>
			<CustomerStackNav.Screen
				name={SCREENS.Barcode as keyof CustomerStackParamList}
				component={BarCodeScanner}
				options={{ headerShown: true }}
			/>
		</CustomerStackNav.Navigator>

		// </CountryProvider>
	);
};

const OrderStack = () => {
	return (
		<OrderStackNav.Navigator
			initialRouteName={SCREENS.ListOrder as keyof OrderStackParamList}
			screenOptions={{ headerShown: false }}
		>
			<OrderStackNav.Screen
				name={SCREENS.ListOrder as keyof OrderStackParamList}
				component={ListOrder}
			/>
			<OrderStackNav.Screen
				name={SCREENS.ListKeys as keyof OrderStackParamList}
				component={ListKeys}
			/>
			<OrderStackNav.Screen
				name={SCREENS.AddEditOrder as keyof OrderStackParamList}
				component={AddEditOrder}
			/>
			<OrderStackNav.Screen
				name={SCREENS.ViewOrder as keyof OrderStackParamList}
				component={ViewOrder}
			/>
		</OrderStackNav.Navigator>
	);
};

const NotificationStack = () => {
	return (
		<NotificationStackNav.Navigator
			initialRouteName={
				SCREENS.ListNotification as keyof NotificationStackParamList
			}
			screenOptions={{ headerShown: false }}
		>
			<NotificationStackNav.Screen
				name={SCREENS.ListNotification as keyof NotificationStackParamList}
				component={ListNotification}
			/>
			<NotificationStackNav.Screen
				name={SCREENS.AddEditNotification as keyof NotificationStackParamList}
				component={AddEditNotification}
			/>
			<NotificationStackNav.Screen
				name={SCREENS.Notifications as keyof NotificationStackParamList}
				component={Notifications}
			/>
		</NotificationStackNav.Navigator>
	);
};

const TabNavigator = () => {
	const insets = useSafeAreaInsets();
	const { users } = useAuth();
	const { colors } = useTheme();

	const logout = () => {
		console.log('ME52RETAILERTESTING', "logoutfunc");
		const logoutfunc = getLogoutFn();
		logoutfunc();
	}

	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarStyle: {
					backgroundColor: '#3C4049',
					height: getHeight(80),
					borderTopLeftRadius: moderateScale(20),
					borderTopRightRadius: moderateScale(20),
					...commonStyle.pt10,
					paddingBottom: insets.bottom,
				},
				tabBarActiveTintColor: '#F39314',
				tabBarInactiveTintColor: '#FFFFFF',
				headerShown: false,
				tabBarShowLabel: true,
			})}
		>
			<Tab.Screen
				name={SCREENS.AdminDashboard}
				component={AdminDashboardScreen}
				options={{
					tabBarIcon: ({ focused, color, size }) => {
						return (
							<View>
								<View
									style={{
										borderWidth: moderateScale(1),
										bottom: getHeight(15),
										borderColor: focused ? '#F39314' : 'transparent',
									}}
								></View>
								<Image
									source={require('../assets/home_icon.png')}
									style={{ tintColor: color }}
								/>
							</View>
						);
					},
					headerShown: true,
					headerTitle: '',
					headerStyle: {
						backgroundColor: '#3C4049',
						alignItems: 'flex-start',
						elevation: 0,
					},

					headerLeft: () => (
						<View
							style={{
								width: moderateScale(110),
								height: getHeight(55),
								...commonStyle.mt10,
								...commonStyle.pb10,
							}}
						>
							<Image
								source={require('../assets/ME_SECURE_LOGO.png')}
								resizeMode="contain"
								style={{ width: '100%', height: '90%' }}
							/>
						</View>
					),

					headerRight: () => (
						<HeaderRight
							users={users}
							logout={logout}
							colors={colors}
							lightColors={lightColors}
						/>
					),

				}}
			/>
			{/* </Tab.Group> */}
			<Tab.Screen
				name={SCREENS.Notification}
				component={NotificationStack}
				options={{
					tabBarIcon: ({ focused, color, size }) => {
						return (
							<View>
								<View
									style={{
										borderWidth: moderateScale(1),
										bottom: getHeight(15),
										borderColor: focused ? '#F39314' : 'transparent',
									}}
								></View>
								<Image
									source={require('../assets/marketing_icon.png')}
									style={{ width: size, height: size, tintColor: color }}
								/>
							</View>
						);
					},
				}}
				listeners={({ navigation, route }) => ({
					tabPress: e => {
						e.preventDefault();
						navigation.dispatch(
							CommonActions.navigate({
								name: SCREENS.Notification,
								params: {
									screen: SCREENS.ListNotification,
								},
							}),
						);
					},
				})}
			/>
			{/* </Tab.Group> */}
			<Tab.Screen
				name={SCREENS.Scanner}
				component={ScannerScreen}
				options={{
					tabBarIcon: ({ focused, color, size }) => {
						return (
							<View
								style={{
									width: moderateScale(70),
									height: moderateScale(70),
									borderRadius: moderateScale(35),
									backgroundColor: '#F39314',
									justifyContent: 'center',
									alignItems: 'center',
									marginTop: getHeight(-50),
									shadowColor: '#000',
									borderWidth: moderateScale(5),
									borderColor: '#fff',
									shadowOffset: {
										width: 0,
										height: 2,
									},
									shadowOpacity: 0.25,
									shadowRadius: 3.84,
									elevation: 5,
								}}
							>
								<Image
									source={require('../assets/qr-code.png')}
									style={{ width: moderateScale(30), height: moderateScale(30) }}
								/>
							</View>
						);
					},
				}}
			/>
			<Tab.Screen
				name={SCREENS.Order}
				component={OrderStack}
				options={{
					tabBarIcon: ({ focused, color, size }) => {
						return (
							<View>
								<View
									style={{
										borderWidth: moderateScale(1),
										bottom: getHeight(15),
										borderColor: focused ? '#F39314' : 'transparent',
									}}
								></View>
								<Image
									source={require('../assets/order_icon.png')}
									style={{ width: size, height: size, tintColor: color }}
								/>
							</View>
						);
					},
				}}
				listeners={({ navigation, route }) => ({
					tabPress: e => {
						e.preventDefault();
						navigation.dispatch(
							CommonActions.navigate({
								name: SCREENS.Order,
								params: {
									screen: SCREENS.ListOrder,
								},
							}),
						);
					},
				})}
			/>
			<Tab.Screen
				name={SCREENS.Customer}
				component={CustomerStack}
				options={{
					tabBarIcon: ({ focused, color, size }) => {
						return (
							<View>
								<View
									style={{
										borderWidth: moderateScale(1),
										bottom: getHeight(15),
										borderColor: focused ? '#F39314' : 'transparent',
									}}
								></View>
								<Image
									source={require('../assets/users_icon.png')}
									style={{ tintColor: color }}
								/>
							</View>
						);
					},
				}}
				listeners={({ navigation, route }) => ({
					tabPress: e => {
						e.preventDefault();
						navigation.dispatch(
							CommonActions.navigate({
								name: SCREENS.Customer,
								params: {
									screen: SCREENS.ListCustomer,
								},
							}),
						);
					},
				})}
			/>
			{/* <Tab.Screen name="Test" component={Test} /> */}
		</Tab.Navigator>
	);
};

const AppNavigator = () => {

	const { settingUsers, isLoggedIn } = useAuth();
	const getUserDetails = async (mounted: boolean) => {
		try {
			const userDetails = await getItem('userdetails');
			console.log('ME52RETAILERTESTING', 'App navigator user details ');
			if (mounted) {
				if (userDetails) {
					const { name, token, type, id, parentType, nameId } = userDetails;
					if (name && token && type && id) {
						settingUsers({ name, token, type, id, parentType, nameId });
					}
				} else {
					const logout = getLogoutFn();
					logout();
				}
			}
		} catch (error) {
			console.log('ME52RETAILERTESTING', 'Error while getUserDetails ', error);
			if (mounted) {
				const logout = getLogoutFn();
				logout();
			}
		}
	};

	useEffect(() => {

		let mounted = true;
		getUserDetails(mounted);

		return () => {
			mounted = false;
		};

	}, []);

	const [appReady, setAppReady] = useState(false);

	useEffect(() => {
		console.log('ME52RETAILERTESTING', 'Setting app ready true');
		let timer = setTimeout(() => {
			setAppReady(true);
		}, 500);

		return () => {
			clearTimeout(timer);
		};
	}, []);

	console.log('ME52RETAILERTESTING', 'isLogged in flag ', isLoggedIn);

	if (!appReady) {
		return <RippleSplash />;
	}

	return (
		<SafeAreaView style={{ flex: 1 }} edges={['bottom', 'top']}>
			<NavigationContainer>
				<Stack.Navigator screenOptions={{ headerShown: false }}>
					{!isLoggedIn ? (
						<>
							<Stack.Screen name={SCREENS.Login}>
								{props => <LoginScreen {...props} />}
							</Stack.Screen>
							<Stack.Screen
								name={SCREENS.ResetPassword}
								component={ResetPassword}

							/>
							<Stack.Screen
								name={SCREENS.ForgotPassword}
								component={ForgotPasswordScreen}
							/>
							<Stack.Screen
								name={SCREENS.OTPVerification}
								component={OTPVerification}
							/>
						</>
					) : (
						<>
							<Stack.Screen name="MainTabs" component={TabNavigator} />
						</>
					)}
					<Stack.Screen name={SCREENS.SetPassword} component={SetPassword} />
					<Stack.Screen name={SCREENS.Profile} component={ProfileScreen} />
					<Stack.Screen name={SCREENS.FAQ} component={FAQScreen} />
					<Stack.Screen name={SCREENS.Message} component={MessageScreen} />
					<Stack.Screen name={SCREENS.SearchPage} component={SearchPage} />
					<Stack.Screen name={SCREENS.SearchPage2} component={SearchPage2} />
					<Stack.Screen
						name={SCREENS.CustomerSupport}
						component={CustomerSupport}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</SafeAreaView>
	);
};

export default React.memo(AppNavigator);
