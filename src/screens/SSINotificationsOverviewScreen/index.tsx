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
import {RootState, ScreenRoutesEnum, StackParamList} from '../../types';
import {useSelector} from 'react-redux';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NOTIFICATIONS_OVERVIEW>;

const SSINotificationsOverviewScreen: FC<Props> = (props: Props): JSX.Element => {
  const state = useSelector((state: RootState) => state.logging);

  //FIXME - replace below with evaluation of list length when notifications are included
  const showTopBorder = 1 > 0;
  const borderTopWidth = showTopBorder ? 1 : 0;

  return (
    // This currently now only shows the empty state.
    <Container style={{borderTopWidth, borderTopColor: '#404D7A'}}>
      <EmptyStateContainer>
        <PrimaryButton caption={'SHOW'} onPress={() => console.log(JSON.stringify(state.activityLogging))} />

        <EmptyStateImageContainer>
          <SSINotificationsImage />
        </EmptyStateImageContainer>
        <TitleText>{translate('notifications_overview_empty_state_title')}</TitleText>
        <SubTitleText>{translate('notifications_overview_empty_state_subtitle')}</SubTitleText>
      </EmptyStateContainer>
    </Container>
  );
};

export default SSINotificationsOverviewScreen;
