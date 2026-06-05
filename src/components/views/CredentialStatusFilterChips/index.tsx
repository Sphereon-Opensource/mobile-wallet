import React, {FC} from 'react';
import {Pressable, Text, View, ViewStyle} from 'react-native';
import {translate} from '../../../localization/Localization';

type Props = {
  showRevoked: boolean;
  showExpired: boolean;
  onToggleRevoked: () => void;
  onToggleExpired: () => void;
};

const chipStyle = (active: boolean): ViewStyle => ({
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: active ? '#5B69E5' : '#404D7A',
  backgroundColor: active ? '#5B69E533' : 'transparent',
});

/**
 * Always-visible "Show: [Revoked] [Expired]" filter row for the credential overview.
 * Both chips drive the persisted user preferences (single source of truth).
 */
export const CredentialStatusFilterChips: FC<Props> = ({showRevoked, showExpired, onToggleRevoked, onToggleExpired}) => (
  <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
    <Text style={{color: '#8791B0', fontSize: 12}}>{translate('credentials_overview_show_label')}</Text>
    <Pressable accessibilityRole="button" accessibilityState={{selected: showRevoked}} onPress={onToggleRevoked} style={chipStyle(showRevoked)}>
      <Text style={{color: showRevoked ? '#FFFFFF' : '#8791B0', fontSize: 12}}>{translate('credential_status_badge_revoked')}</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityState={{selected: showExpired}} onPress={onToggleExpired} style={chipStyle(showExpired)}>
      <Text style={{color: showExpired ? '#FFFFFF' : '#8791B0', fontSize: 12}}>{translate('credential_status_badge_expired')}</Text>
    </Pressable>
  </View>
);

export default CredentialStatusFilterChips;
