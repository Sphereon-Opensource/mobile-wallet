import {Animated, Dimensions, StyleSheet, PanResponder, View, TouchableWithoutFeedback} from 'react-native';
import React, {useRef, useState} from 'react';
import {AusweisModalButtonContainerStyled as ButtonContainer, AusweisModalIconButtonStyled as IconButton} from '../../styles/components';
import {
  SSITextH1SemiBoldLightStyled as TitleCaption,
  SSITextH3LightStyled as DescriptionCaption,
} from '@sphereon/ui-components.ssi-react-native/dist/styles/fonts';
import Localization from '../../localization/Localization';
import CredentialCardPreviewView from '../views/CredentialCardPreviewView';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';

type AnimatedModalProps = {
  [x: string]: any;
};

const AnimatedModal: React.FC<AnimatedModalProps> = ({variant, children, onClose}) => {
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = 730;
  //const [modalHeight, setModalHeight] = useState(0);
  const snapPoint = screenHeight * 0.25; // 25% of the screen height as the snap point

  const panY = useRef(new Animated.Value(screenHeight)).current; // Start modal off-screen

  const resetPosition = Animated.spring(panY, {
    toValue: screenHeight - modalHeight,
    useNativeDriver: true,
  });

  // const closeModal = Animated.timing(panY, {
  //   toValue: screenHeight,
  //   duration: 300,
  //   useNativeDriver: true,
  // });

  const closeModal = () => {
    return new Promise(resolve => {
      Animated.timing(panY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        resolve(true); // Resolve the promise when the animation is complete
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      // onPanResponderMove: (_, gestureState) => {
      //   panY.setValue(screenHeight - modalHeight + gestureState.dy);
      // },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = screenHeight - modalHeight + gestureState.dy;

        // Ensure the modal can't be dragged higher than its initial position
        if (newPosition >= screenHeight - modalHeight) {
          panY.setValue(newPosition);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > snapPoint) {
          closeModal().then(onClose); //.start();
        } else {
          resetPosition.start();
        }
      },
    }),
  ).current;

  React.useEffect(() => {
    resetPosition.start();
  }, [resetPosition]);

  // const onModalLayout = (event: any) => {
  //   const { height } = event.nativeEvent.layout;
  //   setModalHeight(height);
  //   panY.setValue(screenHeight); // Start with the modal off-screen
  //   resetPosition.start(); // Animate the modal into view
  // };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.modal, {transform: [{translateY: panY}]}]}
        {...panResponder.panHandlers}
        //onLayout={onModalLayout}
      >
        <View>
          <IconButton onPress={async () => closeModal().then(onClose)} />
          <TitleCaption>{Localization.translate('ausweis_eid_modal_title')}</TitleCaption>
          <DescriptionCaption>{Localization.translate('ausweis_eid_modal_description')}</DescriptionCaption>
        </View>
        <CredentialCardPreviewView
          title={Localization.translate('ausweis_eid_preview_card_title')}
          description={Localization.translate('ausweis_eid_preview_card_description')}
          issuer={Localization.translate('ausweis_eid_preview_card_issuer')}
        />
        <ButtonContainer>
          <PrimaryButton caption={Localization.translate('ausweis_eid_modal_accept_label')} onPress={async () => console.log('')} />
          <SecondaryButton caption={Localization.translate('action_maybe_later_label')} onPress={async () => closeModal().then(onClose)} />
        </ButtonContainer>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#10101080',
  },
  modal: {
    height: 730,
    width: '100%',
    backgroundColor: '#2C334B',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 10, // For Android shadow
    gap: 25,
    padding: 24,
  },
  modalContent: {
    flex: 1,
    // padding: 20,
  },
});

// ... rest of the code ...
export default AnimatedModal;
