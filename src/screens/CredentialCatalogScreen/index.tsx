import React, {FC, ReactElement} from 'react';
import {RefreshControl, ListRenderItemInfo} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';
import {SSITextH2SemiBoldLightStyled as HeaderCaption} from '@sphereon/ui-components.ssi-react-native';
import CredentialCardPreviewView from '../../components/views/CredentialCardPreviewView';
import SearchField from '../../components/fields/SearchField';
import FilterBar from '../../components/bars/FilterBar';
import CredentialPreviewViewItem from '../../components/views/CredentialPreviewViewItem';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import Localization from '../../localization/Localization';
import {
  CredentialCatalogScreenPreviewCredentialContainerStyled as PreviewCredentialContainer,
  CredentialCatalogScreenRelevantCredentialContainerStyled as RelevantCredentialContainer,
  CredentialCatalogScreenRelevantCredentialHeaderContainerStyled as RelevantCredentialHeaderContainer,
  CredentialCatalogViewAllContainerStyled as ViewAllContainer,
  CredentialCatalogViewAllTextStyled as ViewAllText,
  SSIBasicContainerStyled as Container,
  SSIRippleContainerStyled as ItemContainer,
  CredentialCatalogDiscoverCredentialsContainerStyled as DiscoverCredentialsContainer,
  CredentialCatalogScreenDiscoverCredentialsHeaderContainerStyled as DiscoverCredentialsHeaderContainer,
  CredentialCatalogCredentialListContainerStyled as CredentialListContainer,
  CredentialCatalogScreenPreviewCredentialContentContainerStyled as PreviewCredentialContentContainer,
} from '../../styles/components';
import {MainRoutesEnum, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_CATALOG>;

type CredentialPreview = {
  title: string;
  issuer: string;
  branding?: IBasicCredentialLocaleBranding;
};

const CredentialCatalogScreen: FC<Props> = (props: Props): ReactElement => {
  const [refreshing, setRefreshing] = React.useState(false);

  const credentials: Array<CredentialPreview> = [
    {
      title: 'Girocard',
      issuer: 'EURO Kartensysteme GmbH',
      branding: {
        background: {
          image: {
            uri: 'https://i.ibb.co/NngL9SD/giro-Card-Background.png',
          },
        },
        logo: {
          uri: 'https://i.ibb.co/P928gkN/giro-Card-Logo.png',
          dimensions: {
            width: 2048,
            height: 2048,
          },
        },
      },
    },
    {
      title: 'IKEA Family card',
      issuer: 'IKEA',
      branding: {
        background: {
          image: {
            uri: 'https://i.ibb.co/BC0wC1t/Ikea-Background.jpg',
          },
        },
        logo: {
          uri: 'https://i.ibb.co/NsVbQ3H/Ikea-logo.png',
          dimensions: {
            width: 1280,
            height: 512,
          },
        },
      },
    },
    {
      title: 'DeutschlandCard',
      issuer: 'DeutschlandCard GmbH',
      branding: {
        background: {
          color: '#F2B700',
        },
        logo: {
          uri: 'https://i.ibb.co/r3rQYTk/Deutschlandcard-Logo.png',
          dimensions: {
            width: 250,
            height: 250,
          },
        },
      },
    },
    {
      title: 'BahnBonus Karte',
      issuer: 'Deutsche Bahn AG',
      branding: {
        background: {
          image: {
            uri: 'https://i.ibb.co/f1PjM0K/Deutschebahn-background.png',
          },
        },
        logo: {
          uri: 'https://i.ibb.co/sWF588H/Deutschebahn-Logo.png',
          dimensions: {
            width: 1347,
            height: 1020,
          },
        },
      },
    },
    {
      title: 'dm Vorteilskarte',
      issuer: 'dm drogerie markt GmbH',
      branding: {
        background: {
          image: {
            uri: 'https://i.ibb.co/V22WFDp/codioful-formerly-gradienta-r-Kv4-Hduvz-IE-unsplash.jpg',
          },
        },
        logo: {
          uri: 'https://i.ibb.co/xLj243Q/dm-logo.png',
          dimensions: {
            width: 512,
            height: 512,
          },
        },
      },
    },
    {
      title: 'Rossmann Babywelt',
      issuer: 'Rossmann GmbH',
      branding: {
        background: {
          image: {
            uri: 'https://i.ibb.co/wQcsHnH/Babywelt-background.png',
          },
        },
        logo: {
          uri: 'https://i.ibb.co/7Y23cQp/Babywelt-logo.png',
          dimensions: {
            width: 709,
            height: 311,
          },
        },
      },
    },
  ];

  const onPreview = async (): Promise<void> => {
    props.navigation.navigate(MainRoutesEnum.AUSWEIS_MODAL, {
      onClose: async () => props.navigation.goBack(),
      onAccept: async () => console.log('onAccept pressed'),
    });
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(false);
  };

  const renderItem = (itemInfo: ListRenderItemInfo<CredentialPreview>): ReactElement => {
    const credentialItem = <CredentialPreviewViewItem branding={itemInfo.item.branding} title={itemInfo.item.title} issuer={itemInfo.item.issuer} />;

    const backgroundStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
    };
    const style = {
      ...backgroundStyle,
      ...(itemInfo.index === credentials.length - 1 && // TODO credentials
        itemInfo.index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
    };

    return <ItemContainer style={style}>{credentialItem}</ItemContainer>;
  };

  return (
    <Container>
      <PreviewCredentialContainer>
        <PreviewCredentialContentContainer>
          <SearchField />
          <FilterBar />
          <RelevantCredentialContainer>
            <RelevantCredentialHeaderContainer>
              <HeaderCaption>{Localization.translate('credential_catalog_most_relevant_header_label')}</HeaderCaption>
              <ViewAllContainer>
                <ViewAllText text={Localization.translate('action_view_all_label')} />
              </ViewAllContainer>
            </RelevantCredentialHeaderContainer>
            <CredentialCardPreviewView
              title={Localization.translate('ausweis_eid_preview_card_title')}
              description={Localization.translate('ausweis_eid_preview_card_description')}
              issuer={Localization.translate('ausweis_eid_preview_card_issuer')}
              onPress={onPreview}
            />
          </RelevantCredentialContainer>
        </PreviewCredentialContentContainer>
      </PreviewCredentialContainer>
      <DiscoverCredentialsContainer>
        <DiscoverCredentialsHeaderContainer>
          <HeaderCaption>{Localization.translate('credential_catalog_discover_header_label')}</HeaderCaption>
          <ViewAllContainer>
            <ViewAllText text={Localization.translate('action_view_all_label')} />
          </ViewAllContainer>
        </DiscoverCredentialsHeaderContainer>
        <CredentialListContainer>
          <SwipeListView
            data={credentials}
            keyExtractor={(itemInfo: CredentialPreview) => itemInfo.title}
            renderItem={renderItem}
            closeOnRowOpen
            closeOnRowBeginSwipe
            useFlatList
            initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
            removeClippedSubviews
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        </CredentialListContainer>
      </DiscoverCredentialsContainer>
    </Container>
  );
};

export default CredentialCatalogScreen;
