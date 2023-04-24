import {IVerifiableCredential} from '@sphereon/ssi-types';
import {UniqueVerifiableCredential, VerifiableCredential} from '@veramo/core';
import React, {FC, ForwardedRef} from 'react';
import {View} from 'react-native';

import {translate} from '../../../localization/Localization';
import {backgrounds, icons, statuses} from '../../../styles/colors';
import {
  SSICredentialRequiredViewItemContainerStyled as Container,
  SSIFullFlexDirectionRowViewStyled as ContentContainer,
  SSICredentialRequiredViewItemSelectedCredentialsCaptionStyled as CredentialSelectedCaption,
  SSITextH4Styled as CredentialSubtitleCaption,
  SSICredentialRequiredViewItemCredentialTitleCaptionStyled as CredentialTitleCaption,
  SSICredentialRequiredViewItemIconContainerStyled as IconContainer,
  SSITextFieldLinearTextGradientStyled as LinearGradientTextContainer,
  SSICredentialRequiredViewItemMatchInfoCaptionStyled as MatchInfoCaption,
  SSICredentialRequiredViewItemMatchInfoContainerStyled as MatchInfoContainer,
  SSITextH5LightStyled as NoneAvailableSubCaption,
  SSICredentialRequiredViewItemNoneAvailableCaptionStyled as NoneAvailableCaption,
  SSICredentialRequiredViewNoneAvailableContainerStyled as NoneAvailableContainer,
} from '../../../styles/components';
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon';
import {WrappedVerifiableCredential} from '@sphereon/ssi-types/src/types/vc';
import {getCredentialTypeAsString} from '../../../utils/CredentialUtils';

export interface Props {
  id: string;
  title: string;
  selected: Array<UniqueVerifiableCredential>;
  available?: Array<UniqueVerifiableCredential>;
  isMatching: boolean;
  listIndex: number;
  onPress?: () => Promise<void>;
}

const SSICredentialRequiredViewItem: FC<Props> = React.forwardRef((props: Props, ref?: ForwardedRef<unknown>): JSX.Element => {
  const {id, isMatching, selected, available, title, listIndex, onPress} = props;

  return (
    <Container key={id} style={{backgroundColor: listIndex % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}} onPress={onPress}>
      <ContentContainer>
        <IconContainer>
          <SSICheckmarkIcon color={isMatching ? statuses.valid : icons.noMatch} />
        </IconContainer>
        <ContentContainer>
          <View>
            <CredentialTitleCaption>{title}</CredentialTitleCaption>
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
