import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ProfileIcon = ({size = 40, uri}: {size?: number; uri?: string}) => {
  return (
    <View style={[styles.container, {width: size, height: size, borderRadius: size / 2}]}> 
      {uri ? (
        <Image
          source={{uri}}
          style={{width: size, height: size, borderRadius: size / 2}}
          resizeMode="cover"
        />
      ) : (
        <Icon name="account" size={size * 0.7} color="#FFC107" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#FFC10733',
    borderWidth: 2,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
