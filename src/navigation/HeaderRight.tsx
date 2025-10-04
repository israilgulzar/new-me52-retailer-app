import { Image, TouchableOpacity, View, Text } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Menu, MenuOptions, MenuTrigger, MenuOption } from 'react-native-popup-menu';
import NotificationIcon from '../components/NotificationIcon';
import LogoutImg from '../assets/log_out.svg';
import UserSingle from '../assets/user_single.svg';
import EyePasswordBlack from '../assets/eye-password-show_black.svg';
import { SCREENS } from './screens';
import { scaleSM, verticalScaleSM } from '../utility/helpers';
import { getHeight, moderateScale } from '../common/constants';

export const HeaderRight = ({ users, logout, colors, lightColors }: any) => {
    const navigation = useNavigation<any>();

    return (
        <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => console.log('ME52RETAILERTESTING', 'Notification clicked')}
            >
                <NotificationIcon />
            </TouchableOpacity>
            <Menu style={{ marginTop: 2 }}>
                <MenuTrigger>
                    <Image
                        source={require('../assets/profile_top_icon.png')}
                        style={{
                            width: scaleSM(30),
                            height: scaleSM(30),
                            marginHorizontal: scaleSM(10),
                        }}
                        resizeMode="cover"
                    />
                </MenuTrigger>
                <MenuOptions
                    optionsContainerStyle={{
                        borderRadius: moderateScale(15),
                        overflow: 'hidden',
                        backgroundColor: colors.background,
                    }}
                >

                    {/* My Profile */}
                    <MenuOption
                        style={{
                            flexDirection: 'column',
                            // alignItems: 'center',
                            paddingVertical: getHeight(8),
                            paddingHorizontal: 0,
                            borderBottomWidth: moderateScale(0.5),
                            borderBottomColor: lightColors.tabColor

                        }}
                    >
                        <Text style={{ color: colors.text, marginLeft: 10, fontSize: 18, textTransform: 'capitalize', fontWeight: 700, }}
                            numberOfLines={2}
                        >	{users.name || 'N/A'}</Text>
                        <Text style={{ color: lightColors.boarderDarker, marginLeft: 10, textTransform: 'capitalize', fontWeight: 700 }}>	{users.nameId || 'N/A'}</Text>
                    </MenuOption>
                    <MenuOption
                        onSelect={() => {
                            navigation.navigate(SCREENS.Profile)
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: getHeight(8),
                            paddingHorizontal: moderateScale(15),
                        }}
                    >
                        <View style={{ width: moderateScale(30), height: moderateScale(30), display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: lightColors.darker, borderRadius: moderateScale(20) }}>
                            <UserSingle />
                        </View>
                        <Text style={{ color: colors.text, marginLeft: moderateScale(10), fontWeight: 700 }}>My Profile</Text>
                    </MenuOption>

                    {/* Change Password */}
                    <MenuOption
                        onSelect={() => {
                            navigation.navigate(SCREENS.SetPassword)
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: getHeight(8),
                            paddingHorizontal: moderateScale(15),
                        }}
                    >
                        <View style={{ width: moderateScale(30), height: moderateScale(30), display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: moderateScale(20) }}>
                            <EyePasswordBlack />
                        </View>
                        <Text style={{ color: colors.text, marginLeft: moderateScale(10), fontWeight: 700 }}>Change Password</Text>
                    </MenuOption>

                    {/* Logout */}
                    <MenuOption
                        onSelect={() => logout()}
                        style={{
                            flexDirection: 'row', // place icon and text side by side
                            alignItems: 'center', // vertically center both
                            justifyContent: 'center', // center horizontally
                            paddingVertical: getHeight(10),
                            paddingHorizontal: moderateScale(15),
                            backgroundColor: lightColors.darker,
                            borderRadius: moderateScale(20),
                            margin: moderateScale(10),
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold', marginRight: moderateScale(8) }}>
                            Logout
                        </Text>
                        <LogoutImg />
                    </MenuOption>

                </MenuOptions>

            </Menu>
        </View>
    );
};


