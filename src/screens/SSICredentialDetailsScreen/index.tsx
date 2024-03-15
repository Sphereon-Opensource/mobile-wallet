import React, {FC} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageAttributes} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton, SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import SSIActivityView from '../../components/views/SSIActivityView';
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView';
import SSITabView from '../../components/views/SSITabView';
import {getCredentialStatus} from '../../utils/CredentialUtils';
import {getIssuerLogo} from '../../utils/mappers/credential/CredentialMapper';
import {translate} from '../../localization/Localization';
import {
  SSICredentialDetailsScreenButtonContainer as ButtonContainer,
  SSICredentialDetailsScreenButtonContentContainer as ButtonContainerContent,
  SSICredentialDetailsScreenCredentialCardContainer as CardContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSICredentialDetailsScreenContentContainer as ContentContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialSummary, ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../types';
import {useBackHandler} from '@react-native-community/hooks';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

enum CredentialTabRoutesEnum {
  INFO = 'info',
  ACTIVITY = 'activity',
}

const getCredentialCardLogo = (credential: ICredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }

  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const SSICredentialDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {credential, primaryAction, secondaryAction, showActivity = false, onBack} = props.route.params;
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);

  const routes: Array<ITabViewRoute> = [
    {
      key: CredentialTabRoutesEnum.INFO,
      title: translate('credential_details_info_tab_header_label'),
      content: () => <SSICredentialDetailsView credentialProperties={credential.properties} issuer={issuer} />,
    },
    ...(showActivity
      ? [
          {
            key: CredentialTabRoutesEnum.ACTIVITY,
            title: translate('credential_details_activity_tab_header_label'),
            content: () => <SSIActivityView />,
          },
        ]
      : []),
  ];

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  return (
    <Container>
      <StatusBar />
      <ContentContainer>
        <CardContainer>
          <SSICredentialCardView
            header={{
              credentialTitle: credential.title ?? credential.branding?.alias,
              credentialSubtitle: credential.branding?.description,
              logo: credentialCardLogo,
            }}
            body={{
              issuerName: issuer ?? credential.issuer.name,
            }}
            footer={{
              credentialStatus: getCredentialStatus(credential),
              expirationDate: credential.expirationDate,
            }}
            display={{
              backgroundColor: credential.branding?.background?.color,
              backgroundImage: credential.branding?.background?.image,
              textColor: credential.branding?.text?.color,
            }}
          />
        </CardContainer>
        <SSITabView routes={routes} />
        {/* TODO we use this 2 button structure a lot, we should make a component out of it */}
        {(primaryAction || secondaryAction) && (
          <ButtonContainer>
            <ButtonContainerContent>
              {secondaryAction && (
                <SecondaryButton
                  caption={secondaryAction.caption}
                  onPress={secondaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160,
                    ...(!primaryAction && {width: '100%'}),
                  }}
                />
              )}
              {primaryAction && (
                <PrimaryButton
                  caption={primaryAction.caption}
                  onPress={primaryAction.onPress}
                  // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
                  style={{
                    height: 42,
                    minWidth: 160,
                    ...(!secondaryAction && {width: '100%'}),
                  }}
                />
              )}
            </ButtonContainerContent>
          </ButtonContainer>
        )}
      </ContentContainer>
    </Container>
  );
};

export default SSICredentialDetailsScreen;
