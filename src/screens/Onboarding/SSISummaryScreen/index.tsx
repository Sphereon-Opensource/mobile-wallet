import React, {FC} from 'react';
import {v4 as uuidv4} from 'uuid';
import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import SSIButtonsContainer from '../../../components/containers/SSIButtonsContainer';
import SSICredentialDetailsView from '../../../components/views/SSICredentialDetailsView';
import SSITabView from '../../../components/views/SSITabView';
import {translate} from '../../../localization/Localization';
import {SSIBasicHorizontalCenterContainerStyled as Container} from '../../../styles/components';
import {ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ONBOARDING_SUMMARY>;

enum SummaryTabRoutesEnum {
  INFO = 'info',
}

const SSIOnboardingSummaryScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {context, onBack, onNext} = props.route.params;
  const {personalData} = {...context};

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

  const getProperties = (): Array<CredentialDetailsRow> => {
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
        style={{paddingRight: 24, paddingLeft: 24}} // FIXME fix styling so that padding is in a styling component
        backgroundColor={backgroundColors.secondaryDark}
        primaryButton={{
          caption: translate('onboard_summary_button_caption'),
          onPress: onNext,
        }}
      />
    </Container>
  );
};

export default SSIOnboardingSummaryScreen;
