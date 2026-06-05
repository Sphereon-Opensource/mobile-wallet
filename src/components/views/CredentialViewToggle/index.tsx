import React, {FC} from 'react';
import {ColorValue, Pressable, View, ViewStyle} from 'react-native';
import Svg, {Path, Rect} from 'react-native-svg';
import {ViewPreference} from '../../../types/preferences';

const ListIcon: FC<{color: ColorValue}> = ({color}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M8 6h12M8 12h12M8 18h12" stroke={color as string} strokeWidth={2} strokeLinecap="round" />
    <Path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" stroke={color as string} strokeWidth={2.6} strokeLinecap="round" />
  </Svg>
);

const CardIcon: FC<{color: ColorValue}> = ({color}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={3} width={16} height={7} rx={2.5} fill={color as string} opacity={0.45} />
    <Rect x={4} y={11} width={16} height={10} rx={2.5} fill={color as string} />
  </Svg>
);

const SEGMENT: ViewStyle = {width: 38, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8};

type Props = {
  value: ViewPreference;
  onChange: (value: ViewPreference) => void;
};

/**
 * Modern segmented control for switching between the list and card credential views.
 * Fully controlled — the selected segment is driven by `value`, so it never desyncs from the
 * rendered view (unlike the previous tab-navigator indicator).
 */
export const CredentialViewToggle: FC<Props> = ({value, onChange}) => {
  const renderSegment = (target: ViewPreference, label: string, Icon: FC<{color: ColorValue}>) => {
    const active = value === target;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{selected: active}}
        onPress={() => onChange(target)}
        style={[SEGMENT, active ? {backgroundColor: '#5B69E5'} : {}]}>
        <Icon color={active ? '#FFFFFF' : '#8791B0'} />
      </Pressable>
    );
  };

  return (
    <View style={{flexDirection: 'row', backgroundColor: '#2A3048', borderRadius: 11, padding: 3, gap: 2}}>
      {renderSegment(ViewPreference.LIST, 'List view', ListIcon)}
      {renderSegment(ViewPreference.CARD, 'Card view', CardIcon)}
    </View>
  );
};

export default CredentialViewToggle;
