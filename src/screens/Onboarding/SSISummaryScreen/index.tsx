import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import {v4 as uuidv4} from 'uuid';

import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';
import SSICredentialDetailsView from '../../../components/views/SSICredentialDetailsView';
import SSITabView from '../../../components/views/SSITabView';
import {translate} from '../../../localization/Localization';
import {backgrounds} from '../../../styles/colors';
import {SSIBasicHorizontalCenterContainerStyled as Container} from '../../../styles/components';
import {ICredentialDetailsRow, ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_SUMMARY>;

enum SummaryTabRoutesEnum {
  INFO = 'info',
}

const SSIOnboardingSummaryScreen: FC<Props> = (props: Props): JSX.Element => {
  const {context, onBack, onNext} = props.route.params;
  const {personalData} = {...context};

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
    }
    // make sure event stops here
    return true;
  });
  const getProperties = (): Array<ICredentialDetailsRow> => {
    return [
      {
        id: uuidv4(),
        label: translate('first_name_label'),
        value: personalData.firstName,
      },
      {
        id: uuidv4(),
        label: translate('last_name_label'),
        value: personalData.lastName,
      },
      {
        id: uuidv4(),
        label: translate('email_address_label'),
        value: personalData.emailAddress,
      },
    ];
  };

  const routes: Array<ITabViewRoute> = [
    {
      key: SummaryTabRoutesEnum.INFO,
      title: translate('onboard_summary_info_tab_header_label'),
      // TODO replace refactored SSICredentialDetailsView to general component
      content: () => <SSICredentialDetailsView credentialProperties={getProperties()} />,
    },
  ];

  return (
    <Container>
      <SSITabView routes={routes} />
      <SSIButtonsContainer
        backgroundColor={backgrounds.secondaryDark}
        primaryButton={{
          caption: translate('onboard_summary_button_caption'),
          onPress: onNext,
        }}
      />
    </Container>
  );
};

export default SSIOnboardingSummaryScreen;
