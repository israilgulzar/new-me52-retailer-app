import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  Image,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { imageUrl } from '../utility/images';
import Lock from '../assets/lock.svg';
import Unlock from '../assets/unlock.svg';
import { commonStyle } from '../theme';
import { moderateScale } from '../common/constants';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?:
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'neutral'
  | 'outline_lighter'
  | 'outline_darker'
  | 'darker'
  | 'orange'
  | 'outline_orange';
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  icon?: string;
  textStyle?: TextStyle;
  smaller?: boolean;
  left?: boolean;
};

const BUTTON_STYLE: ViewStyle | TextStyle = {
  borderRadius: moderateScale(12),
  ...commonStyle.pv10,
  ...commonStyle.mv10,
  ...commonStyle.rowCenter,
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  fullWidth = false,
  loading = false,
  style,
  disabled = false,
  icon,
  textStyle,
  smaller,
  left,
}: ButtonProps) => {
  const { colors, theme } = useTheme();
  const getBg = () => {
    if (
      variant === 'outline' ||
      variant === 'outline_lighter' ||
      variant === 'outline_darker' ||
      variant === 'outline_orange'
    )
      return 'transparent';
    if (theme === 'dark') return colors.primary;
    if (variant === 'darker') return colors.darker;
    if (variant === 'orange') return colors.orange;
    return colors.primary;
  };
  const getTextColor = () => {
    if (variant === 'outline') return colors.primary;
    if (theme === 'dark') return '#212121';
    if (variant === 'darker' || variant === 'orange') return colors.white;
    if (variant === 'outline_darker' || variant === 'outline_lighter')
      return colors.textDarker;
    if (variant === 'outline_orange') return colors.orange;
    return '#212121';
  };

  const getBorderColor = () => {
    if (variant === 'outline_darker') return colors.boarderDarker;
    if (variant === 'outline_lighter') return colors.borderLighter;
    if (variant === 'outline_orange') return colors.orange;
    return colors.border;
  };
  const imagepath =
    imageUrl[icon as keyof typeof imageUrl] ||
    require('../assets/delete_icon.png');

  return (
    <TouchableOpacity
      style={[
        smaller ? styles.smallerBtn : styles.button,
        {
          backgroundColor: getBg(),
          borderColor: getBorderColor(),
          borderWidth:
            variant === 'outline' ||
              variant === 'outline_darker' ||
              variant === 'outline_lighter' ||
              variant === 'outline_orange'
              ? 2
              : 0,
          width: fullWidth ? '100%' : '50%',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {icon &&
        left &&
        (variant === 'outline_orange' ? (
          <Unlock style={commonStyle.mr5} />
        ) : (
          <Lock color="#F39314" style={commonStyle.mr5} />
        ))}
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
      {icon && !left && <Image source={imagepath} style={[styles.icon]} />}
    </TouchableOpacity>
  );
};

export default React.memo(Button);

const styles = StyleSheet.create({
  button: {
    ...BUTTON_STYLE,
  },

  smallerBtn: {
    ...BUTTON_STYLE,
    // paddingVertical: 10
  },

  text: {
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    // textAlign: 'center'
  },
  icon: {
    marginLeft: moderateScale(10),
    width: moderateScale(22),
    height: moderateScale(22),
  },
});
