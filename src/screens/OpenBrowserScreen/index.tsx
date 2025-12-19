import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, JSX} from 'react';
import {View} from 'react-native';
import ActivitiesImage from '../../components/assets/images/ActivitiesImage';
import {translate} from '../../localization/Localization';
import {
  SSIWelcomeViewBodyContainerStyled as BodyContainer,
  SSITextH3RegularLightStyled as BodyText,
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIWelcomeViewContentContainerStyled as ContentContainer,
  OpenBrowserScreenEmptyStateImageContainerStyled as EmptyStateImageContainer,
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
      <ContentContainer style={{alignItems: 'center', paddingHorizontal: 24}}>
        <HeaderCaption style={{textAlign: 'center'}}>{translate(headerCaptioni18n ?? 'browser_open_header')}</HeaderCaption>
        <TitleCaption style={{textAlign: 'center'}}>{translate(titleCaptioni18n ?? 'browser_open_auth_title')}</TitleCaption>
        <BodyContainer style={{alignItems: 'center'}}>
          <EmptyStateImageContainer>
            <ActivitiesImage />
          </EmptyStateImageContainer>
          <View style={{paddingHorizontal: 16, alignItems: 'center'}}>
            <BodyText style={{paddingRight: 0, marginRight: 0, textAlign: 'center'}}>
              {translate(bodyTexti18n ?? 'browser_open_auth_body')}
            </BodyText>
          </View>
        </BodyContainer>
      </ContentContainer>
      <View style={{marginTop: 'auto', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 60}}>
        <PrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{height: 42, width: 300}}
          caption={translate(actionNextLabeli18n ?? 'browser_open_action_next_label')}
          onPress={onNext}
        />
      </View>
    </Container>
  );
};

export default OpenBrowserScreen;
