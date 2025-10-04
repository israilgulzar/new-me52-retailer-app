import { Image, Text, View } from "react-native"
import { commonStyle } from "../theme"
import { moderateScale } from "../common/constants"

const NoDataFound = ({ label }: { label?: string }) => {
    return (
        <View style={commonStyle.flexCenter} >
            <Image
                style={{ width: moderateScale(250), height: moderateScale(250) }}
                resizeMode="contain"
                source={require('../assets/no_data_found.png')} />
            {label && <Text style={{ fontSize: 18, fontWeight: '500', color: '#666', textAlign: 'center' }}>{label}</Text>}
        </View>
    )
}

export default NoDataFound