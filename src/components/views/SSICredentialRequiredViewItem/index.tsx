import { IVerifiableCredential } from '@sphereon/ssi-types'
import { VerifiableCredential } from '@veramo/core'
import React, { FC, ForwardedRef } from 'react'
import { View } from 'react-native'

import { translate } from '../../../localization/Localization'
import { backgrounds, icons, statuses } from '../../../styles/colors'
import {
  SSICredentialRequiredViewItemContainerStyled as Container,
  SSIFullFlexDirectionRowViewStyled as ContentContainer,
  SSICredentialRequiredViewItemSelectedCredentialSCaptionStyled as CredentialSelectedCaption,
  SSITextH4Styled as CredentialSubtitleCaption,
  SSICredentialRequiredViewItemCredentialTitleCaptionStyled as CredentialTitleCaption,
  SSICredentialRequiredViewItemIconContainerStyled as IconContainer,
  SSITextFieldLinearTextGradientStyled as LinearGradientTextContainer,
  SSICredentialRequiredViewItemMatchInfoCaptionStyled as MatchInfoCaption,
  SSICredentialRequiredViewItemMatchInfoContainerStyled as MatchInfoContainer,
} from '../../../styles/components'
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon'

export interface Props {
  id: string
  title: string
  selected: Array<VerifiableCredential>
  available: Array<VerifiableCredential>
  isMatching: boolean
  listIndex: number
  onPress: () => Promise<void>
}

const SSICredentialRequiredViewItem: FC<Props> = React.forwardRef((props: Props, ref?: ForwardedRef<unknown>): JSX.Element => {
  const {
    id,
    isMatching,
    selected,
    available,
    title,
    listIndex,
    onPress,
  } = props;

  return (
    <Container
      key={id}
      style={{backgroundColor: listIndex % 2 == 0 ? backgrounds.secondaryDark : backgrounds.primaryDark}}
      onPress={onPress}
    >
      <ContentContainer>
        <IconContainer>
          <SSICheckmarkIcon color={isMatching ? statuses.valid : icons.noMatch}/>
        </IconContainer>
        <ContentContainer>
          <View>
            <CredentialTitleCaption>{title}</CredentialTitleCaption>
            { selected.length > 0
              // TODO currently only supporting one selected credential, Also fix the naming
              ? <CredentialSelectedCaption>{(selected[0] as IVerifiableCredential).type[1]}</CredentialSelectedCaption>
              : <LinearGradientTextContainer>
                  <CredentialSubtitleCaption>{translate('credentials_required_credential_select_label')}</CredentialSubtitleCaption>
                </LinearGradientTextContainer>
            }
          </View>
          <MatchInfoContainer>
            <MatchInfoCaption style={{...(isMatching && {color: statuses.valid})}}>
              { selected.length > 0
                ? `${selected.length} ${translate('credentials_required_selected_label')}`
                : `${available.length} ${translate('credentials_required_available_label')}`
              }
            </MatchInfoCaption>
          </MatchInfoContainer>
        </ContentContainer>
      </ContentContainer>
    </Container>
  );
});

export default SSICredentialRequiredViewItem
