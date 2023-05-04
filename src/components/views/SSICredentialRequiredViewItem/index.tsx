import {UniqueVerifiableCredential} from '@veramo/core';
import React, {FC, ForwardedRef} from 'react';
import {View} from 'react-native';

import {translate} from '../../../localization/Localization';
import {backgrounds, statuses} from '../../../styles/colors';
import {
  SSICredentialRequiredViewItemContainerStyled as Container,
  SSIFullFlexDirectionRowViewStyled as ContentContainer,
  SSICredentialRequiredViewItemCredentialPurposeCaptionStyled as CredentialPurposeCaption,
  SSICredentialRequiredViewItemSelectedCredentialsCaptionStyled as CredentialSelectedCaption,
  SSITextH4Styled as CredentialSubtitleCaption,
  SSICredentialRequiredViewItemCredentialTitleCaptionStyled as CredentialTitleCaption,
  SSICredentialRequiredViewItemIconContainerStyled as IconContainer,
  SSITextFieldLinearTextGradientStyled as LinearGradientTextContainer,
  SSICredentialRequiredViewItemMatchInfoCaptionStyled as MatchInfoCaption,
  SSICredentialRequiredViewItemMatchInfoContainerStyled as MatchInfoContainer,
  SSICredentialRequiredViewItemNoneAvailableCaptionStyled as NoneAvailableCaption,
  SSICredentialRequiredViewNoneAvailableContainerStyled as NoneAvailableContainer,
  SSITextH5LightStyled as NoneAvailableSubCaption,
} from '../../../styles/components';
import {getCredentialTypeAsString} from '../../../utils/CredentialUtils';
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon';

export interface Props {
  id: string;
  title: string;
  selected: Array<UniqueVerifiableCredential>;
  available?: Array<UniqueVerifiableCredential>;
  purpose?: string;
  isMatching: boolean;
  listIndex: number;
  onPress?: () => Promise<void>;
}

const SSICredentialRequiredViewItem: FC<Props> = React.forwardRef((props: Props, ref?: ForwardedRef<unknown>): JSX.Element => {
  const {id, isMatching, selected, available, title, listIndex, purpose, onPress} = props;

  return (
    <Container key={id} style={{backgroundColor: listIndex % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}} onPress={onPress}>
      <ContentContainer>
        {isMatching && (
          <IconContainer>
            <SSICheckmarkIcon color={statuses.valid} />
          </IconContainer>
        )}
        <ContentContainer style={{...(!isMatching && {marginLeft: 29})}}>
          <View>
            <CredentialTitleCaption>{title}</CredentialTitleCaption>
            {purpose && <CredentialPurposeCaption>{purpose}</CredentialPurposeCaption>}
            {selected.length > 0 ? (
              // TODO currently only supporting one selected credential, Also fix the naming
              <CredentialSelectedCaption>{getCredentialTypeAsString(selected[0].verifiableCredential)}</CredentialSelectedCaption>
            ) : available && available.length === 0 ? (
              <NoneAvailableCaption>{translate('credentials_required_no_available_label')}</NoneAvailableCaption>
            ) : (
              <LinearGradientTextContainer>
                <CredentialSubtitleCaption>{translate('credentials_required_credential_select_label')}</CredentialSubtitleCaption>
              </LinearGradientTextContainer>
            )}
          </View>
          <MatchInfoContainer>
            <MatchInfoCaption style={{...(isMatching && {color: statuses.valid})}}>
              {selected.length > 0
                ? `${selected.length} ${translate('credentials_required_selected_label')}`
                : available
                ? `${available.length} ${translate('credentials_required_available_label')}`
                : translate('credentials_required_checking_label')}
            </MatchInfoCaption>
          </MatchInfoContainer>
        </ContentContainer>
      </ContentContainer>
      {available && available.length === 0 && (
        <NoneAvailableContainer>
          <NoneAvailableSubCaption>{translate('credentials_required_no_available_additional_label')}</NoneAvailableSubCaption>
        </NoneAvailableContainer>
      )}
    </Container>
  );
});

export default SSICredentialRequiredViewItem;
