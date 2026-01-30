import {useBackHandler} from '@react-native-community/hooks';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ImageAttributes, backgroundColors, fontColors, toLocalDateString} from '@sphereon/ui-components.core';
import {CredentialDetailsRow, CredentialSummary, getCredentialStatus, getIssuerLogo} from '@sphereon/ui-components.credential-branding';
import {PrimaryButton, SSICredentialCardView, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, useMemo} from 'react';
import {FlatList, ListRenderItemInfo, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import NavigationButton from '../../components/buttons/NavigationButton';
import {Chat, ChatTools} from '../../components/chat/Chat';
import SSIImageField from '../../components/fields/SSIImageField';
import SSITextField from '../../components/fields/SSITextField';
import {useAccessibility} from '../../hooks/useAccessibility';
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
  const {announce} = useAccessibility();
  const insets = useSafeAreaInsets();
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
  // this is a loose differentiation between adding a credential and viewing a credential
  const isAddingNewCredential = hideLinks;

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
      {!isAddingNewCredential && (
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

  const screenContext = useMemo(
    () => `
    this screen shows credential details. onscreen credential: ${stringifyState(credential)}.
    ${
      !isAddingNewCredential &&
      `Please note that this is not a new credential, but an existing one. The user is currently just
      viewing the details of an existing credential. The user is not currently in the process of adding a new credential.
      There is nothing you can help the user with, other than answering questions regarding this credential`
    }
  `,
    [credential],
  );

  const AddNewCredentialtools: ChatTools = useMemo(
    () => [
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
      ...(primaryAction
        ? [
            {
              tool: {
                name: 'accept',
                description: 'accept the credential offer',
                parameters: {},
              },
              callback: () => {
                primaryAction && primaryAction.onPress();
              },
            },
          ]
        : []),
      ...(secondaryAction
        ? [
            {
              tool: {
                name: 'decline',
                description: 'decline the credential offer',
                parameters: {},
              },
              callback: () => {
                secondaryAction && secondaryAction.onPress();
              },
            },
          ]
        : []),
    ],
    [primaryAction, secondaryAction],
  );

  useFocusEffect(() => announce({message: `Credential details for ${credential.branding?.alias ?? credential.title}`, delay: 1000}));

  return (
    <Container style={{paddingTop: 24}}>
      <StatusBar />
      <ContentContainer>
        <CardContainer>
          <View
            accessible
            accessibilityLabel={`${credential.title}. Issued by: ${credential.issuer.alias}, on: ${toLocalDateString(
              credential.issueDate,
            )}. Expires on: ${toLocalDateString(credential.expirationDate)}. Status: ${credential.credentialStatus}`}>
            <View importantForAccessibility="no-hide-descendants">
              <SSICredentialCardView
                header={{
                  credentialTitle: credential.branding?.alias ?? credential.title,
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
            </View>
          </View>
        </CardContainer>
        <SSITextH3LightStyled
          accessibilityRole="header"
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: '#404D7A',
          }}>
          Card information
        </SSITextH3LightStyled>
        <FlatList
          accessibilityRole="list"
          accessibilityLabel={`${credential.title} details`}
          style={{backgroundColor: backgroundColors.secondaryDark, flex: 1}}
          data={credential.properties}
          renderItem={renderItem}
          keyExtractor={(item: CredentialDetailsRow) => item.id}
          initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
          removeClippedSubviews
          contentContainerStyle={{flexGrow: 1}}
          ListFooterComponentStyle={{flex: 1, justifyContent: 'flex-end'}}
          ListFooterComponent={renderFooter}
        />
        {(primaryAction || secondaryAction) && (
          <View
            style={{
              padding: 24,
              paddingTop: 32,
              paddingBottom: Math.max(32, insets.bottom),
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
                accessibilityLabel={primaryAction.accessibilityLabel}
              />
            )}
            {secondaryAction && (
              <SecondaryButton
                caption={secondaryAction.caption}
                onPress={secondaryAction.onPress}
                accessibilityLabel={secondaryAction.accessibilityLabel}
              />
            )}
          </View>
        )}
      </ContentContainer>
      <Chat screenContext={screenContext} tools={isAddingNewCredential ? AddNewCredentialtools : []} />
    </Container>
  );
};

export default CredentialDetailsScreen;
