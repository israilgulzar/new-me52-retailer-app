import React from 'react';
import {Text as RNText, StyleSheet, TextProps as RNTextProps} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';

type Typography = 'heading' | 'body' | 'caption';

type Props = RNTextProps & {
  variant?: Typography;
  style?: any;
  children: React.ReactNode;
};

const Text = ({variant = 'body', style, children, ...rest}: Props) => {
  const {colors} = useTheme();
  return (
    <RNText
      style={[
        styles[variant],
        {color: colors.text},
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 13,
    color: '#757575',
  },
});

export default React.memo(Text)
