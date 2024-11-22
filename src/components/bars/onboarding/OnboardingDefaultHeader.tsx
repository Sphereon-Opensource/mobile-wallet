import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useCallback, useMemo, useState} from 'react';
import {Pressable} from 'react-native';
import {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import OnboardingSettingsModal, {MODAL_HEIGHT} from '../../../modals/OnboardingSettingsModal';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingHeaderContainerStyled as Container} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import SettingsIcon from '../../assets/icons/SettingsIcon';
import {HeaderSecondaryBarRow} from '../HeaderSecondaryBar/Row';
import {Back} from '../components';

export type Props = NativeStackHeaderProps & {onBack?: () => Promise<void>};

const SettingsCogWheel = ({onPress}: {onPress: () => void}) => (
  <Pressable style={({pressed}) => ({opacity: pressed ? 0.7 : 1})} onPress={onPress}>
    <SettingsIcon color="white" width={22} height={22} />
  </Pressable>
);

const OnboardingDefaultHeader: FC<Props> = ({onBack}: Props): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  const [isVisible, setIsVisible] = useState(false);
  const show = useSharedValue(false);
  const modalStyle = useAnimatedStyle(() => {
    const translateY = withTiming(show.value ? 0 : MODAL_HEIGHT, {duration: 200, easing: Easing.ease});
    return {
      transform: [{translateY}],
    };
  });

  const showModal = useCallback(() => {
    setIsVisible(true);
    show.value = true;
  }, [setIsVisible]);

  const closeModal = useCallback(() => {
    show.value = false;
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  }, [setIsVisible]);

  const Left = useMemo(() => <Back onPress={() => (onBack ? onBack() : onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))} />, [onBack]);

  const Right = useMemo(() => <SettingsCogWheel onPress={showModal} />, [showModal]);

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderSecondaryBarRow left={Left} right={Right} />
      {isVisible && <OnboardingSettingsModal style={modalStyle} onModalClose={closeModal} />}
    </Container>
  );
};

export default OnboardingDefaultHeader;
