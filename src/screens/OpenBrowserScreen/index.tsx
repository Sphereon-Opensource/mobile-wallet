import {useBackHandler} from '@react-native-community/hooks';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC} from 'react';
import {
  SSIBasicHorizontalCenterContainerStyled as Container,
  SSIButtonBottomContainerStyled as ButtonContainer,
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
  const {context, onBack, onNext} = props.route.params;

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

  console.log('OpenBrowserScreen');

  return (
    <Container>
      <ContentContainer>
        <HeaderCaption>Browser needed</HeaderCaption>
        <TitleCaption>External authentication required</TitleCaption>
        <BodyContainer>
          <BodyText>_RP_ requires you to authenticate. Your default browser will be used for this action</BodyText>
        </BodyContainer>
      </ContentContainer>
      <ButtonContainer>
        <PrimaryButton
          // TODO move styling to styled components (currently there is an issue where this styling prop is not being set correctly)
          style={{height: 42, width: 300}}
          caption="Open browser"
          onPress={onNext}
        />
      </ButtonContainer>
    </Container>
  );
};

export default OpenBrowserScreen;
