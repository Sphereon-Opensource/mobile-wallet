import React, {FC} from 'react';
import {Pressable, View, ViewStyle} from 'react-native';
import SSIEyeIcon from '../../assets/icons/SSIEyeIcon';
import SSIEyeOffIcon from '../../assets/icons/SSIEyeOffIcon';
import {translate} from '../../../localization/Localization';

const SEGMENT: ViewStyle = {width: 38, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8};

type Props = {
  valuesVisible: boolean;
  onChange: (visible: boolean) => void;
};

/**
 * Modern segmented control for hiding/showing claim values on the credential detail screen,
 * matching the list/card view toggle style.
 */
export const CredentialValuesToggle: FC<Props> = ({valuesVisible, onChange}) => (
  <View style={{flexDirection: 'row', backgroundColor: '#2A3048', borderRadius: 11, padding: 3, gap: 2}}>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate('credential_details_hide_values')}
      accessibilityState={{selected: !valuesVisible}}
      onPress={() => onChange(false)}
      style={[SEGMENT, !valuesVisible ? {backgroundColor: '#5B69E5'} : {}]}>
      <SSIEyeOffIcon size={18} color={!valuesVisible ? '#FFFFFF' : '#8791B0'} />
    </Pressable>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={translate('credential_details_show_values')}
      accessibilityState={{selected: valuesVisible}}
      onPress={() => onChange(true)}
      style={[SEGMENT, valuesVisible ? {backgroundColor: '#5B69E5'} : {}]}>
      <SSIEyeIcon size={18} color={valuesVisible ? '#FFFFFF' : '#8791B0'} />
    </Pressable>
  </View>
);

export default CredentialValuesToggle;
