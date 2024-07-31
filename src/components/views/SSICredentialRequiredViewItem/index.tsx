import {backgroundColors, gradientsColors, statusColors} from '@sphereon/ui-components.core';
import React, {FC, ForwardedRef} from 'react';
import {View} from 'react-native';

import {translate} from '../../../localization/Localization';
import {
  SSICredentialRequiredViewItemContainerStyled as Container,
  SSICredentialRequiredViewItemCredentialPurposeCaptionStyled as CredentialPurposeCaption,
  SSICredentialRequiredViewItemCredentialTitleCaptionStyled as CredentialTitleCaption,
  SSICredentialRequiredViewItemIconContainerStyled as IconContainer,
  SSICredentialRequiredViewItemMatchInfoCaptionStyled as MatchInfoCaption,
  SSICredentialRequiredViewItemMatchInfoContainerStyled as MatchInfoContainer,
  SSICredentialRequiredViewItemNoneAvailableCaptionStyled as NoneAvailableCaption,
  SSICredentialRequiredViewItemSelectedCredentialsCaptionStyled as CredentialSelectedCaption,
  SSICredentialRequiredViewNoneAvailableContainerStyled as NoneAvailableContainer,
  SSIFullFlexDirectionRowViewStyled as ContentContainer,
  // SSITextH4Styled as CredentialSubtitleCaption,
  SSITextH5LightStyled as NoneAvailableSubCaption,
} from '../../../styles/components';
import {fontStyle} from '../../../styles/typography';
import {getCredentialTypeAsString} from '../../../utils';
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon';
import {LinearGradientText} from 'react-native-linear-gradient-text';
import {UniqueDigitalCredential} from '@sphereon/ssi-sdk.credential-store';
import {VerifiableCredential} from '@veramo/core';

export interface Props {
  id: string;
  title: string;
  selected: Array<UniqueDigitalCredential>;
  available?: Array<UniqueDigitalCredential>;
  purpose?: string;
  isMatching: boolean;
  listIndex: number;
  onPress?: () => Promise<void>;
}

const SSICredentialRequiredViewItem: FC<Props> = React.forwardRef((props: Props, ref?: ForwardedRef<unknown>): JSX.Element => {
  const {id, isMatching, selected, available, title, listIndex, purpose, onPress} = props;

  return (
    <Container
      key={id}
      style={{backgroundColor: listIndex % 2 == 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark}}
      onPress={onPress}>
      <View>
        <ContentContainer>
          {isMatching && (
            <IconContainer>
              <SSICheckmarkIcon color={statusColors.valid} />
            </IconContainer>
          )}
          <ContentContainer style={{...(!isMatching && {marginLeft: 29})}}>
            <View>
              <CredentialTitleCaption>{title}</CredentialTitleCaption>
              {purpose && <CredentialPurposeCaption>{purpose}</CredentialPurposeCaption>}
              {selected.length > 0 ? (
                // TODO currently only supporting one selected credential, Also fix the naming
                <CredentialSelectedCaption>
                  {getCredentialTypeAsString(selected[0].originalVerifiableCredential as VerifiableCredential)}
                </CredentialSelectedCaption>
              ) : available && available.length === 0 ? (
                <NoneAvailableCaption>{translate('credentials_required_no_available_label')}</NoneAvailableCaption>
              ) : (
                <LinearGradientText
                  text={translate('credentials_required_credential_select_label')}
                  colors={[gradientsColors['100'].secondaryColor, gradientsColors['100'].primaryColor]}
                  start={{x: 1, y: 1}}
                  end={{x: 0, y: 0}}
                  textStyle={{...fontStyle.h4Regular}}
                />
              )}
            </View>
            <MatchInfoContainer>
              <MatchInfoCaption style={{...(isMatching && {color: statusColors.valid})}}>
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
      </View>
    </Container>
  );
});

export default SSICredentialRequiredViewItem;
