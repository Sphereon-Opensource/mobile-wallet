import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageAttributes, backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow, CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {PrimaryButton, SSICredentialCardView, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, useMemo} from 'react';
import {FlatList, ListRenderItemInfo, View} from 'react-native';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import {NavigationButton} from '../../components/NavigationButton';
import SSIImageField from '../../components/fields/SSIImageField';
import SSITextField from '../../components/fields/SSITextField';
import {useAppSelector} from '../../hooks/useStore';
import {translate} from '../../localization/Localization';
import {
  CredentialDetailsScreenCredentialCardContainer as CardContainer,
  SSIBasicHorizontalCenterContainerStyled as Container,
  CredentialDetailsScreenContentContainer as ContentContainer,
  SSICredentialDetailsViewFooterLabelValueStyled as IssuedBy,
  SSICredentialDetailsViewFooterLabelCaptionStyled as IssuedByLabel,
  SSICredentialDetailsViewFooterContainerStyled as IssuerFooterContainer,
  SSITextH3LightStyled,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {Divider} from '../../styles/components/screens/SSIContactDetailsScreen';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {Chat} from '../../components/chat/Chat';
import {stringifyState} from '../../utils/stringifyState';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

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
  const {navigation, route} = props;
  const {credential, onBack, primaryAction, secondaryAction, hideLinks} = route.params;
  const issuer: string = credential.issuer.alias;
  const credentialCardLogo: ImageAttributes | undefined = getCredentialCardLogo(credential);
  const contacts = useAppSelector(state => state.contact.contacts);
  const contact = contacts.find(c => c.contact.displayName === issuer);
  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };

  const renderFooter = () => (
    <>
      <IssuerFooterContainer>
        {issuer && (
          <>
            <IssuedByLabel>{translate('credential_details_view_issued_by')}</IssuedByLabel>
            <IssuedBy>{issuer}</IssuedBy>
          </>
        )}
      </IssuerFooterContainer>
      {!hideLinks && (
        <View
          style={{
            backgroundColor: backgroundColors.primaryDark,
            marginTop: 16,
            paddingHorizontal: 16,
          }}>
          <NavigationButton
            label={`${translate('activity.contact_link')} ${issuer}`}
            onPress={() => contact && navigation.push(ScreenRoutesEnum.CONTACT_DETAILS, {contact})}
            disabled={!contact}
          />
          <Divider />
          <NavigationButton
            label={translate('activity.credential_activities_link')}
            onPress={() => contact && navigation.push(ScreenRoutesEnum.CREDENTIAL_ACTIVITY, {credential})}
          />
        </View>
      )}
    </>
  );

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

  const screenContext = useMemo(() => `this screen shows credential details. onscreen credential: ${stringifyState(credential)}`, [credential]);

  const tools = useMemo(() => {
    const tools = [
      {
        tool: {
          name: 'editAlias',
          description: 'edit alias. Change the name of the contact',
          parameters: {},
        },
        callback: () => {
          console.log('edit alias');
        },
      },
      {
        tool: {
          name: 'editConsent',
          description: 'edit consent',
          parameters: {},
        },
        callback: () => {
          console.log('edit consent');
        },
      },
    ];
    if (primaryAction && !primaryAction.disabled) {
      tools.push({
        tool: {
          name: 'accept',
          description: 'accept contact',
          parameters: {},
        },
        callback: () => {
          primaryAction && primaryAction.onPress();
        },
      });
    }
    if (secondaryAction && !secondaryAction.disabled) {
      tools.push({
        tool: {
          name: 'decline',
          description: 'decline contact',
          parameters: {},
        },
        callback: () => {
          secondaryAction && secondaryAction.onPress();
        },
      });
    }
    return tools;
  }, [primaryAction, secondaryAction]);

  return (
    <Container style={{paddingTop: 24}}>
      <StatusBar />
      <ContentContainer>
        <CardContainer>
          <SSICredentialCardView
            header={{
              credentialTitle: credential.branding?.alias,
              credentialSubtitle: credential.branding?.description ?? 'Personal Identification Data', // FIXME Funke
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
        <SSITextH3LightStyled
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: '#404D7A',
          }}>
          Card information
        </SSITextH3LightStyled>
        <FlatList
          style={{backgroundColor: backgroundColors.secondaryDark, flex: 1}}
          data={credential.properties}
          renderItem={renderItem}
          keyExtractor={(item: CredentialDetailsRow) => item.id}
          initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
          ListFooterComponent={renderFooter}
        />
        {(primaryAction || secondaryAction) && (
          <View
            style={{
              padding: 24,
              paddingVertical: 32,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}>
            {primaryAction && (
              <PrimaryButton
                caption={primaryAction.caption}
                captionColor={fontColors.light}
                onPress={primaryAction.onPress}
                disabled={primaryAction.disabled}
              />
            )}
            {secondaryAction && <SecondaryButton caption={secondaryAction.caption} onPress={secondaryAction.onPress} />}
          </View>
        )}
      </ContentContainer>
      <Chat buttonPosition={{bottom: 100, right: 16}} screenContext={screenContext} tools={tools} />
    </Container>
  );
};

export default CredentialDetailsScreen;
