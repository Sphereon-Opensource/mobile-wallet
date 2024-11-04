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

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW>;

const SSINotificationsOverviewScreen: FC<Props> = (props: Props): JSX.Element => {
  //FIXME - replace below with evaluation of list length when notifications are included
  const showTopBorder = 1 > 0;
  const borderTopWidth = showTopBorder ? 1 : 0;

  const onPress = async () => {
    props.navigation.navigate(ScreenRoutesEnum.NEW_CONTACT_ADD, {
      partyName: 'Bram ten Cate',
      isFederationTrusted: false,
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
