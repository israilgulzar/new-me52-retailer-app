import { Platform, TextStyle, ViewStyle } from "react-native";
import { moderateScale } from "../common/constants";

export const root: ViewStyle = {
    flex: 1
}

export const normalCard: ViewStyle = {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, 
}

export const labelStyle: ViewStyle | TextStyle = {
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 15,
}

export const width: ViewStyle | TextStyle = {
    width: '100%'
}

export const buttonRow: ViewStyle | TextStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  }
  
export const btn: ViewStyle | TextStyle = {
    flex: 1,
    marginHorizontal: 2,
}

export const boxShadow: ViewStyle | TextStyle = {
    // backgroundColor: '#fff', // must be set for shadow to show
    borderRadius: moderateScale(15),
    padding: moderateScale(15),

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25, // 0x40 in hex = 25% opacity
        shadowRadius: 4,
      },
      android: {
        elevation: 2, // Not exact, but closest match
      },
    }),
}

export const inputPadding: TextStyle | ViewStyle = {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
}
export const borderRadius: TextStyle | ViewStyle = {
    borderRadius: 16
}