import React, {FC, ReactElement, useEffect} from 'react';
import {TouchableWithoutFeedback, View} from 'react-native';
import {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  PrimaryButton,
  SecondaryButton,
  SSITextH1SemiBoldLightStyled as TitleCaption,
  SSITextH3LightStyled as DescriptionCaption,
} from '@sphereon/ui-components.ssi-react-native';
import CredentialCardPreviewView from '../../components/views/CredentialCardPreviewView';
import Localization from '../../localization/Localization';
import {
  SSIBasicModalContainerStyled as Container,
  AusweisModalButtonContainerStyled as ButtonContainer,
  AusweisModalIconButtonStyled as IconButton,
  AusweisModalAnimatedViewStyled as AnimatedView,
} from '../../styles/components';
import {MainRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, MainRoutesEnum.AUSWEIS_MODAL>;

// TODO if we want to use this type of modal more we should extract the view into a component and then use it in this modal

const AusweisModal: FC<Props> = (props: Props): ReactElement => {
  const {onClose, onAccept} = props.route.params;

  const ANIMATION_DURATION = 200;
  const MODAL_OFFSET = 600;

  const translateY = useSharedValue(MODAL_OFFSET);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: translateY.value}],
    };
  });

  const slideIn = (): void => {
    translateY.value = withTiming(0, {duration: ANIMATION_DURATION});
  };

  const slideOut = () => {
    return new Promise((resolve): void => {
      translateY.value = withTiming(MODAL_OFFSET, {duration: ANIMATION_DURATION}, (): void => {
        runOnJS(resolve)(true);
      });
    });
  };

  useEffect((): void => {
    slideIn();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => slideOut().then(onClose)}>
      <Container>
        <TouchableWithoutFeedback onPress={e => e.preventDefault()}>
          <AnimatedView style={animatedStyle}>
            <View>
              <IconButton onPress={() => slideOut().then(onClose)} />
              <TitleCaption>{Localization.translate('ausweis_eid_modal_title')}</TitleCaption>
              <DescriptionCaption>{Localization.translate('ausweis_eid_modal_description')}</DescriptionCaption>
            </View>
            <CredentialCardPreviewView
              title={Localization.translate('ausweis_eid_preview_card_title')}
              description={Localization.translate('ausweis_eid_preview_card_description')}
              issuer={Localization.translate('ausweis_eid_preview_card_issuer')}
            />
            <ButtonContainer>
              <PrimaryButton caption={Localization.translate('ausweis_eid_modal_accept_label')} onPress={onAccept} />
              <SecondaryButton caption={Localization.translate('action_maybe_later_label')} onPress={() => slideOut().then(onClose)} />
            </ButtonContainer>
          </AnimatedView>
        </TouchableWithoutFeedback>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default AusweisModal;
