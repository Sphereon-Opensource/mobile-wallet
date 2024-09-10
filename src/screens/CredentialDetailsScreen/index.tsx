import React, {FC} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {backgroundColors, ImageAttributes} from '@sphereon/ui-components.core';
import {CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {SSICredentialCardView} from '@sphereon/ui-components.ssi-react-native';
import SSIActivityView from '../../components/views/SSIActivityView';
import SSICredentialDetailsView from '../../components/views/SSICredentialDetailsView';
import SSITabView from '../../components/views/SSITabView';
import SSIButtonsContainer from '../../components/containers/SSIButtonsContainer';
import {translate} from '../../localization/Localization';
import {
  CredentialDetailsScreenCredentialCardContainer as CardContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  CredentialDetailsScreenContentContainer as ContentContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

enum CredentialTabRoutesEnum {
  INFO = 'info',
  ACTIVITY = 'activity',
}

const getCredentialCardLogo = (credential: CredentialSummary): ImageAttributes | undefined => {
  if (credential.branding?.logo?.uri || credential.branding?.logo?.dataUri) {
    return credential.branding.logo;
  }

  const uri: string | undefined = getIssuerLogo(credential, credential.branding);
  if (uri) {
    return {uri};
  }
};

const CredentialDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
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
        <SSIButtonsContainer
          style={{paddingLeft: 24, paddingRight: 24}} // FIXME create a styling component for this or align design with other button placements
          backgroundColor={backgroundColors.secondaryDark}
          {...(secondaryAction && {
            secondaryButton: {
              caption: secondaryAction.caption,
              onPress: secondaryAction.onPress,
            },
          })}
          {...(primaryAction && {
            primaryButton: {
              caption: primaryAction.caption,
              onPress: primaryAction.onPress,
            },
          })}
        />
      </ContentContainer>
    </Container>
  );
};

export default CredentialDetailsScreen;
