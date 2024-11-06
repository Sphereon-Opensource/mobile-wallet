import React, {FC} from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import SSINotificationsImage from '../../components/assets/images/SSINotificationsImage';
import {translate} from '../../localization/Localization';
import {
  SSIBasicContainerStyled as Container,
  SSINotificationsOverviewScreenEmptyStateContainerStyled as EmptyStateContainer,
  SSINotificationsOverviewScreenEmptyStateImageContainerStyled as EmptyStateImageContainer,
  SSINotificationsOverviewScreenEmptyStateTitleTextStyled as TitleText,
  SSITextH4LightStyled as SubTitleText,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {Party, PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW>;

const SSINotificationsOverviewScreen: FC<Props> = (props: Props): JSX.Element => {
  //FIXME - replace below with evaluation of list length when notifications are included
  const showTopBorder = 1 > 0;
  const borderTopWidth = showTopBorder ? 1 : 0;

  const onPress = async () => {
    props.navigation.navigate(ScreenRoutesEnum.NEW_CONTACT_ADD, {
      onCreate: async () => console.log('on create prop pressed'),
      onDecline: async () => console.log('on decline prop pressed'),
      name: 'Bram ten Cate',
      federations: [
        {
          id: '96ef563c-419d-464f-a0f1-9fe1c46767b7',
          uri: 'example.com',
          roles: [],
          identities: [],
          electronicAddresses: [],
          physicalAddresses: [],
          relationships: [],
          partyType: {
            id: 'cf7e12c8-f5d4-44f2-8027-7cd0de54da28',
            type: PartyTypeType.NATURAL_PERSON,
            origin: PartyOrigin.EXTERNAL,
            name: 'example_name',
            tenantId: '0605761c-4113-4ce5-a6b2-9cbae2f9d289',
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          contact: {
            id: '37bb6e0f-2fb6-4940-babc-8d26baa0e842',
            firstName: 'example_first_name',
            middleName: 'example_middle_name',
            lastName: 'example_last_name',
            displayName: 'example_display_name',
            metadata: [],
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
        },
      ],
    });
  };

  return (
    // This currently now only shows the empty state.
    <Container style={{borderTopWidth, borderTopColor: '#404D7A'}}>
      <EmptyStateContainer>
        <EmptyStateImageContainer>
          <SSINotificationsImage />
        </EmptyStateImageContainer>
        <TitleText>{translate('notifications_overview_empty_state_title')}</TitleText>
        <SubTitleText>{translate('notifications_overview_empty_state_subtitle')}</SubTitleText>
      </EmptyStateContainer>
      <PrimaryButton caption={'SHOW'} onPress={onPress} />
    </Container>
  );
};

export default SSINotificationsOverviewScreen;
