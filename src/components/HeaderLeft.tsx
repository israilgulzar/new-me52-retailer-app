import { TouchableOpacity } from 'react-native';
import NavigationBack from '../assets/navigation_back.svg';
import { moderateScale } from '../common/constants';

const HeaderLeft = ({ navigation }: any) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.8}
      style={{ marginRight: moderateScale(10), bottom: 0, marginVertical: moderateScale(10) }}
    >
      <NavigationBack height={moderateScale(40)} width={moderateScale(40)} />
    </TouchableOpacity>
  );
};

export default HeaderLeft;
