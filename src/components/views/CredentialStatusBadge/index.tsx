import React, {FC, useState} from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import styled from 'styled-components/native';
import {translate} from '../../../localization/Localization';
import {CredentialStatusResult, WalletCredentialStatus} from '../../../types/credentialStatus';

const COLORS: Record<WalletCredentialStatus, string> = {
  [WalletCredentialStatus.VALID]: '#22D366',
  [WalletCredentialStatus.SUSPENDED]: '#FFA726',
  [WalletCredentialStatus.REVOKED]: '#C81E1E',
  [WalletCredentialStatus.EXPIRED]: '#FF9900',
  // Untrusted status list (bad signature / untrusted x5c). A dark/intense caution yellow so it reads as a
  // solid warning badge with white text (a light yellow would be illegible). Recoverable, not permanent.
  [WalletCredentialStatus.UNTRUSTED]: '#D4A017',
};

// Revoked/expired/untrusted render as a solid badge (white content) to stand out as warnings; valid and
// suspended stay subtle/outlined.
const SOLID_STATES = new Set<WalletCredentialStatus>([
  WalletCredentialStatus.REVOKED,
  WalletCredentialStatus.EXPIRED,
  WalletCredentialStatus.UNTRUSTED,
]);

const Row = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Badge = styled(View)<{color: string; solid: boolean}>`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: 5px 12px;
  border-radius: 14px;
  background-color: ${props => (props.solid ? props.color : `${props.color}33`)};
  border-width: 1px;
  border-color: ${props => (props.solid ? '#FFFFFF' : `${props.color}80`)};
`;

const Dot = styled(View)<{color: string}>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 6px;
`;

const Label = styled.Text<{color: string}>`
  color: ${props => props.color};
  font-size: 13px;
  font-weight: 600;
`;

const Chevron = styled.Text`
  color: #8791b0;
  font-size: 12px;
`;

const DetailBox = styled(View)`
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: #2a3048;
`;

const DetailLabel = styled.Text`
  color: #8791b0;
  font-size: 11px;
`;

const DetailValue = styled.Text`
  color: #ffffff;
  font-size: 12px;
`;

const VerifyButton = styled(Pressable)`
  margin-top: 12px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  background-color: #5b69e5;
`;

const VerifyButtonText = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
`;

type Props = {
  result: CredentialStatusResult;
  isChecking?: boolean;
  onVerify?: () => void;
};

const formatCheckedAt = (date?: Date): string => {
  if (!date) {
    return translate('credential_status_never_verified');
  }
  try {
    return new Date(date).toLocaleString();
  } catch {
    return String(date);
  }
};

export const CredentialStatusBadge: FC<Props> = ({result, isChecking, onVerify}) => {
  const [open, setOpen] = useState(false);
  const color = COLORS[result.status];
  const solid = SOLID_STATES.has(result.status);
  const contentColor = solid ? '#FFFFFF' : color;
  const hasStatusList = !!result.statusListInfo;
  // Revoked/expired are permanent — re-verifying is meaningless. Offer it only for the reversible states
  // (valid refresh, suspended, untrusted), where a re-check can legitimately change the outcome.
  const canVerify = hasStatusList && result.status !== WalletCredentialStatus.REVOKED && result.status !== WalletCredentialStatus.EXPIRED;

  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        accessibilityRole="button"
        accessibilityLabel={translate(`credential_status_badge_${result.status.toLowerCase()}`)}>
        <Row>
          <Badge color={color} solid={solid}>
            <Dot color={contentColor} />
            <Label color={contentColor}>{translate(`credential_status_badge_${result.status.toLowerCase()}`)}</Label>
          </Badge>
          <Chevron>{open ? '▲' : '▼'}</Chevron>
        </Row>
      </Pressable>
      {open && (
        <DetailBox>
          <DetailLabel>{translate('credential_status_detail_last_verified')}</DetailLabel>
          <DetailValue>{isChecking ? translate('credential_status_verifying') : formatCheckedAt(result.checkedAt)}</DetailValue>
          {hasStatusList && (
            <>
              <DetailLabel style={{marginTop: 10}}>{translate('credential_status_detail_uri')}</DetailLabel>
              <DetailValue selectable>{result.statusListInfo!.uri}</DetailValue>
              <DetailLabel style={{marginTop: 10}}>{translate('credential_status_detail_index')}</DetailLabel>
              <DetailValue selectable>{String(result.statusListInfo!.index)}</DetailValue>
              {onVerify && canVerify && (
                <VerifyButton onPress={() => !isChecking && onVerify()} disabled={isChecking} accessibilityRole="button">
                  {isChecking && <ActivityIndicator size="small" color="#ffffff" />}
                  <VerifyButtonText>
                    {isChecking ? translate('credential_status_verifying') : translate('credential_status_verify_now')}
                  </VerifyButtonText>
                </VerifyButton>
              )}
            </>
          )}
        </DetailBox>
      )}
    </View>
  );
};

export default CredentialStatusBadge;
