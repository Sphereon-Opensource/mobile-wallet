import {LinearGradient} from 'expo-linear-gradient';
import React, {FC, PropsWithChildren} from 'react';
import {View} from 'react-native';

export const CredentialCardSheen: FC<PropsWithChildren> = ({children}) => {
  return (
    <View style={{borderRadius: 16, overflow: 'hidden'}}>
      {children}
      {/* Diagonal sheen */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.13)', 'rgba(255, 255, 255, 0.06)', 'transparent']}
        locations={[0, 0.35, 0.5, 0.65, 1]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
      />
      {/* Top edge highlight */}
      <LinearGradient colors={['rgba(255, 255, 255, 0.1)', 'transparent']} style={{position: 'absolute', top: 0, left: 0, right: 0, height: 1}} />
      {/* Left edge - card thickness */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'transparent']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={{position: 'absolute', top: 0, left: 0, bottom: 0, width: 2.5}}
      />
      {/* Bottom edge - card thickness (lighter since bottom section is already light) */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.05)']}
        style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5}}
      />
    </View>
  );
};
