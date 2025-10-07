import { useState } from "react"
import UploadPicker from "../components/UploadPicker"
import { Image, TouchableOpacity, View } from "react-native"
import DateRangeCalendar from "../components/DateRangeCalendars"
import { scaleSM, verticalScaleSM } from "../utility/helpers"
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu"
import NotificationIcon from "../assets/inscreen_notification.svg"
import { useAuth } from "../context/AuthContext"


const Test = () => {
  const [value, setValue] = useState(null)
  const { userProfile } = useAuth()
  const onChangeText = (e: any) => {
    setValue(e)
  }
  console.log('ME52RETAILERTESTING', "User profile is here ", userProfile)
  return (
    <View style={{ flex: 1 }}>
      {/* <UploadPicker value={value} onChangeText={onChangeText} width={100}  height={100} imageOrVideo="image"/> */}
      {/* <DateRangeCalendar/> */}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => console.log('ME52RETAILERTESTING', "Notification clicked")}>
          {/* <Image source={require("../assets/notification_icon.png")} width={30} height={30} style={{}} /> */}
          <NotificationIcon width={scaleSM(30)} height={verticalScaleSM(30)} />
        </TouchableOpacity>
        <Menu>
          <MenuTrigger>
            <Image source={require("../assets/profile_top_icon.png")} style={{ width: scaleSM(30), height: scaleSM(30), marginHorizontal: scaleSM(10) }} resizeMode='cover' />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption>
              <View>

              </View>
            </MenuOption>
            <MenuOption>

            </MenuOption>
            <MenuOption>

            </MenuOption>
            <MenuOption>

            </MenuOption>
          </MenuOptions>
        </Menu>

        {/* <TouchableOpacity activeOpacity={0.8} onPress={() => console.log('ME52RETAILERTESTING',"Profile clicked")}> */}
        {/* <Profile style={{marginLeft: scaleSM(10), marginRight: scaleSM(10)}}/> */}

        {/* <View style={[{ width: scaleSM(25), height: verticalScaleSM(25), marginHorizontal: scaleSM(15), marginTop: verticalScaleSM(2) }]}>
                <Image source={require("../assets/profile_top_icon.png")} style={{ width: "100%", height: "100%" }} resizeMode='cover' />
              </View>
            </TouchableOpacity> */}
      </View>
    </View>
  )
}

export default Test