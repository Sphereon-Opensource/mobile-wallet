import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import ActivitiesImage from '../../components/assets/images/ActivitiesImage';
import {translate} from '../../localization/Localization';
import {
  SSIBasicContainerStyled as Container,
  SSINotificationsOverviewScreenEmptyStateContainerStyled as EmptyStateContainer,
  SSINotificationsOverviewScreenEmptyStateImageContainerStyled as EmptyStateImageContainer,
  SSITextH4LightStyled as SubTitleText,
  SSINotificationsOverviewScreenEmptyStateTitleTextStyled as TitleText,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW>;

const SSINotificationsOverviewScreen: FC<Props> = (props: Props): JSX.Element => {
  //FIXME - replace below with evaluation of list length when notifications are included
  const showTopBorder = 1 > 0;
  const borderTopWidth = showTopBorder ? 1 : 0;

  return (
    // This currently now only shows the empty state.
    <Container style={{borderTopWidth, borderTopColor: '#404D7A'}}>
      <EmptyStateContainer>
        <EmptyStateImageContainer>
          <ActivitiesImage />
        </EmptyStateImageContainer>
        <TitleText>{translate('notifications_overview_empty_state_title')}</TitleText>
        <SubTitleText>{translate('notifications_overview_empty_state_subtitle')}</SubTitleText>
      </EmptyStateContainer>
    </Container>
  );
};

export default SSINotificationsOverviewScreen;
