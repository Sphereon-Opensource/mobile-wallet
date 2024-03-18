import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC} from 'react';
import SSINotificationsImage from '../../components/assets/images/SSINotificationsImage';
import {translate} from '../../localization/Localization';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIButtonBottomContainerStyled as ButtonContainer,
  SSINotificationsOverviewScreenEmptyStateImageContainerStyled as EmptyStateImageContainer,
  SSITextH3RegularLightStyled as BodyText,
  SSIWelcomeViewBodyContainerStyled as BodyContainer,
  SSIWelcomeViewContentContainerStyled as ContentContainer,
  SSIWelcomeViewHeaderTextStyled as HeaderCaption,
  SSIWelcomeViewTitleTextStyled as TitleCaption,
} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.BROWSER_OPEN>;
const OpenBrowserScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {onBack, onNext, bodyTexti18n, actionNextLabeli18n, titleCaptioni18n, headerCaptioni18n} = props.route.params;

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

  return (
    <Container>
      <ContentContainer>
        <HeaderCaption>{translate(headerCaptioni18n ?? 'browser_open_header')}</HeaderCaption>
        <TitleCaption>{translate(titleCaptioni18n ?? 'browser_open_auth_title')}</TitleCaption>
        <BodyContainer>
          <EmptyStateImageContainer>
            <SSINotificationsImage />
          </EmptyStateImageContainer>
          <BodyText>{translate(bodyTexti18n ?? 'browser_open_auth_body')}</BodyText>
        </BodyContainer>
      </ContentContainer>
      <ButtonContainer>
        <PrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{height: 42, width: 300}}
          caption={translate(actionNextLabeli18n ?? 'browser_open_action_next_label')}
          onPress={onNext}
        />
      </ButtonContainer>
    </Container>
  );
};

export default OpenBrowserScreen;
