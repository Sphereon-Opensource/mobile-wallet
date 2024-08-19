import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {translate} from '../../../localization/Localization';
import React, {FC, useMemo} from 'react';
import {ITabViewRoute, ScreenRoutesEnum, StackParamList} from 'src/types';
import SSITermsOfServiceView from 'src/components/views/SSITermsOfServiceView';
import SSITabView from 'src/components/views/SSITabView';
import {
  SSIBasicContainerStyled as Container,
  SSITermsOfServiceScreenTabViewContainerStyled as TabViewContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../../styles/components';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.TERMS_OF_SERVICE_DETAIL>;
enum TermsTabRoutesEnum {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

const SSITermsOfServiceDetailScreen: FC<Props> = (props: Props): React.JSX.Element => {
  const {
    navigation: {goBack, canGoBack},
    route: {params},
  } = props;


  useBackHandler((): boolean => {
    if (canGoBack()) {
      goBack();
      return true;
    }
    return false;
  });

  const routes: Array<ITabViewRoute> = [
    {
      key: TermsTabRoutesEnum.TERMS,
      title: translate('terms_of_service_terms_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('terms_and_conditions_agreement_message')} />,
    },
    {
      key: TermsTabRoutesEnum.PRIVACY,
      title: translate('terms_of_service_privacy_tab_header_label'),
      content: () => <SSITermsOfServiceView content={translate('privacy_policy_agreement_message')} />,
    },
  ];

  /**
   * As we update the state for the checkboxes, the other elements of this screen will also rerender. In this case the ScrollView will reset it`s position.
   * useMemo will make sure it will not rerender if the state of the parent gets updated
   */
  const memoTabView = useMemo(() => <SSITabView routes={routes} />, []);

  return (
    <Container>
      <StatusBar />
      <TabViewContainer>{memoTabView}</TabViewContainer>
    </Container>
  );
};

export default SSITermsOfServiceDetailScreen;
