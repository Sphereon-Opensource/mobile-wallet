import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {CredentialStatus, ImageAttributes, toLocalDateTimeString} from '@sphereon/ui-components.core';
import {CredentialSummary, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import React, {useEffect, useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import styled from 'styled-components/native';
import {Section} from '../../components/activity/Section';
import {CredentialCardSheen} from '../../components/views/CredentialCardSheen';
import {translate} from '../../localization/Localization';
import {getVerifiableCredential} from '../../services/credentialService';
import {SSITextH3Styled, SSITextH4LightStyled} from '../../styles/components';
import {IStatusChangeActivity, ScreenRoutesEnum, StackParamList} from '../../types';
import {StatusListInfo} from '../../types/credentialStatus';
import {extractStatusListInfo} from '../../utils/credentialStatus';
import {toDisplayCredentialStatus} from '../../utils/credentialVisibility';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ACTIVITY_DETAILS> & {
  activity: IStatusChangeActivity;
};

type BoxColors = {bg: string; title: string; desc: string};

const STATUS_BOX: Record<string, BoxColors> = {
  REVOKED: {bg: '#C81E1E2A', title: '#F3B5B5', desc: '#E59A9A'},
  EXPIRED: {bg: '#FF99002A', title: '#FFD79A', desc: '#F0C488'},
  SUSPENDED: {bg: '#FFA7262A', title: '#FFD9A8', desc: '#F0C488'},
  UNTRUSTED: {bg: '#D4A0172A', title: '#EAD7A0', desc: '#DCC78F'},
  VALID: {bg: '#00C2492A', title: '#BAE3CB', desc: '#A8D3BB'},
};

// The card represents the outcome of THIS status-change event, so it reflects the activity's "to" status
// (e.g. an untrusted -> valid recovery shows a valid card), not a possibly-stale stored snapshot.
const STATUS_DISPLAY: Record<string, CredentialStatus> = {
  REVOKED: CredentialStatus.REVOKED,
  EXPIRED: CredentialStatus.EXPIRED,
  SUSPENDED: CredentialStatus.SUSPENDED,
  UNTRUSTED: CredentialStatus.UNTRUSTED,
  VALID: CredentialStatus.VALID,
};

const CARD_WIDTH = 330;
const PARENT_CONTAINER_TOTAL_PADDING_HORIZONTAL = 32;

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }
  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const Box = styled.View`
  padding: 12px 16px;
  border-radius: 8px;
  margin-horizontal: 8px;
  gap: 6px;
`;

const DetailRow = styled.View`
  margin-horizontal: 8px;
  gap: 2px;
`;

const DetailLabel = styled(SSITextH4LightStyled)`
  color: #8791b0;
  font-size: 12px;
`;

const DetailValue = styled(SSITextH4LightStyled)`
  color: #ffffff;
  font-size: 13px;
`;

const statusLabel = (status?: string): string =>
  status ? translate(`credential_status_badge_${status.toLowerCase()}`) : translate('credential_status_badge_valid');

const CredentialStatusChangeActivity = ({activity}: Props) => {
  const {credential, credentialHash, status, fromStatus, statusListInfo, at} = activity;
  const screenWidth = useWindowDimensions().width;
  const scale = (screenWidth - PARENT_CONTAINER_TOTAL_PADDING_HORIZONTAL) / CARD_WIDTH;
  const colors = STATUS_BOX[status] ?? STATUS_BOX.VALID;

  // Older entries may not carry the status-list info — resolve it from the credential on the fly.
  const [resolvedInfo, setResolvedInfo] = useState<StatusListInfo | undefined>(statusListInfo as StatusListInfo | undefined);
  useEffect(() => {
    let active = true;
    if (!resolvedInfo && credential) {
      getVerifiableCredential({credentialRole: credential.credentialRole, hash: credentialHash})
        .then(unique => {
          if (!active || !unique) return;
          try {
            setResolvedInfo(extractStatusListInfo(JSON.parse(unique.digitalCredential.uniformDocument)));
          } catch {
            // ignore
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {credential && (
        <View style={{marginHorizontal: 'auto', marginVertical: 16, transform: [{scale}]}}>
          <CredentialCardSheen>
            <SSICredentialCardView
              header={{
                credentialTitle: credential.branding?.alias ?? credential.title,
                credentialSubtitle: credential.branding?.description,
                logo: getCredentialCardLogo(credential),
              }}
              body={{issuerName: credential.issuer.alias ?? credential.issuer.name}}
              footer={{credentialStatus: STATUS_DISPLAY[status] ?? toDisplayCredentialStatus(credential), expirationDate: credential.expirationDate}}
              display={{
                backgroundColor: credential.branding?.background?.color,
                backgroundImage: credential.branding?.background?.image,
                textColor: credential.branding?.text?.color,
              }}
            />
          </CredentialCardSheen>
        </View>
      )}

      <Section title={translate('activity_status_change_section_title')}>
        <Box style={{backgroundColor: colors.bg}}>
          <SSITextH3Styled style={{color: colors.title}}>{translate(`credential_status_toast_${status.toLowerCase()}_title`)}</SSITextH3Styled>
          <SSITextH4LightStyled style={{color: colors.desc}}>{`${statusLabel(fromStatus)}  →  ${statusLabel(status)}`}</SSITextH4LightStyled>
        </Box>
      </Section>

      {resolvedInfo && (
        <Section title={translate('activity_status_change_statuslist_title')}>
          <DetailRow>
            <DetailLabel>{translate('credential_status_detail_uri')}</DetailLabel>
            <DetailValue selectable>{resolvedInfo.uri}</DetailValue>
          </DetailRow>
          <DetailRow style={{marginTop: 8}}>
            <DetailLabel>{translate('credential_status_detail_index')}</DetailLabel>
            <DetailValue selectable>{String(resolvedInfo.index)}</DetailValue>
          </DetailRow>
        </Section>
      )}

      <Section title={translate('activity_status_change_when_title')}>
        <DetailRow>
          <DetailValue>{toLocalDateTimeString(new Date(at).getTime())}</DetailValue>
        </DetailRow>
      </Section>
    </>
  );
};

export default CredentialStatusChangeActivity;
