import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'

import { CredentialStatusEnum, ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton'
import SSISecondaryButton from '../../components/buttons/SSISecondaryButton'
import SSIActivityView from '../../components/views/SSIActivityView'
import SSICardView from '../../components/views/SSICardView'
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView'
import SSITabView from '../../components/views/SSITabView'
import { translate } from '../../localization/Localization'
import {
  SSICredentialDetailsScreenButtonContainer as ButtonContainer,
  SSICredentialDetailsScreenButtonContentContainer as ButtonContainerContent,
  SSICredentialDetailsScreenCredentialCardContainer as CardContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSICredentialDetailsScreenContentContainer as ContentContainer
} from '../../styles/components'
import DateUtils from '../../utils/DateUtils'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>

enum CredentialTabRoutesEnum {
  INFO = 'info',
  ACTIVITY = 'activity'
}

const SSICredentialDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const { credential, primaryAction, secondaryAction, showActivity = false } = props.route.params
  const issuer = typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.name

  const routes = [
    {
      key: CredentialTabRoutesEnum.INFO,
      title: translate('credential_details_info_tab_header_label'),
      content: () => <SSICredentialDetailsView credentialProperties={credential.properties} issuer={issuer} />
    },
    ...(showActivity
      ? [
          {
            key: CredentialTabRoutesEnum.ACTIVITY,
            title: translate('credential_details_activity_tab_header_label'),
            content: () => <SSIActivityView />
          }
        ]
      : [])
  ]

  return (
    <Container>
      <ContentContainer>
        <CardContainer>
          <SSICardView
            credentialTitle={credential.title}
            issuerName={issuer}
            expirationDate={DateUtils.toLocalDateString(credential.expirationDate)}
            credentialStatus={CredentialStatusEnum.VALID} // TODO status should come from the credential object
          />
        </CardContainer>
        <SSITabView routes={routes} />
        {/* TODO we use this 2 button structure a lot, we should make a component out of it */}
        {(primaryAction || secondaryAction) && (
          <ButtonContainer>
            <ButtonContainerContent>
              {secondaryAction && (
                <SSISecondaryButton
                  title={secondaryAction.caption}
                  onPress={secondaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160.5,
                    width: primaryAction ? undefined : '100%'
                  }}
                />
              )}
              {primaryAction && (
                <SSIPrimaryButton
                  title={primaryAction.caption}
                  onPress={primaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160.5,
                    width: secondaryAction ? undefined : '100%'
                  }}
                />
              )}
            </ButtonContainerContent>
          </ButtonContainer>
        )}
      </ContentContainer>
    </Container>
  )
}

export default SSICredentialDetailsScreen
