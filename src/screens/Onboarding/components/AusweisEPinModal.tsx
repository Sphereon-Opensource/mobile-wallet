import {PinInput} from '@pakenfit/react-native-pin-input';
import {FC, ReactElement, useCallback, useEffect, useRef} from 'react';
import {TextInput, TouchableWithoutFeedback} from 'react-native';
import Animated, {Easing, useAnimatedKeyboard, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import AusweisIcon from '../../../components/assets/icons/AusweisIcon';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {SSITextH1RegularStyled, SSITextH3RegularStyled} from '../../../styles/components';
import {IconContainer, ModalCard} from './styles';

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (pin: string) => void;
  errorMessage?: string
};

const AusweisEPinModal: FC<Props> = (props: Props): ReactElement | null => {
  const {
    errorMessage,
    isVisible,
    onClose,
    onComplete
  } = props
  const ref = useRef<TextInput>(null);
  const keyboard = useAnimatedKeyboard();
  const style = useAnimatedStyle(() => {
    const bottom = withTiming(isVisible ? 15 : -250, {duration: 300, easing: Easing.ease});
    return {
      position: 'absolute',
      alignSelf: 'center',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      bottom,
      transform: [
        {
          translateY: -keyboard.height.value,
        },
      ],
    };
  });
  const titleRef = useRef(null);
  const {setFocus} = useAccessibility();
  const focusOnTitle = useCallback(() => {
    if (titleRef.current) setFocus(titleRef);
  }, [titleRef.current]);
  useEffect(() => {
    if (isVisible) {
      focusOnTitle();
    }
  }, [isVisible]);
  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={style}>
      <ModalCard>
        <IconContainer>
          <AusweisIcon />
        </IconContainer>
        <SSITextH1RegularStyled ref={titleRef} style={{color: '#8F8E94'}}>
          Enter Ausweis eID pin
        </SSITextH1RegularStyled>
        { errorMessage
            ? <SSITextH3RegularStyled style={{color: '#D74500'}}>{errorMessage}</SSITextH3RegularStyled>
            : <SSITextH3RegularStyled>Your pin code is unique to your card</SSITextH3RegularStyled>
        }
          <PinInput
            ref={ref}
            inputProps={{placeholder: '', caretHidden: true, secureTextEntry: true}}
            inputStyle={{
              height: 50,
              width: 40,
              fontSize: 16,
            }}
            onFillEnded={onComplete}
            length={6}
            autoFocus={true}
          />
      </ModalCard>
    </Animated.View>
  );
};

export default AusweisEPinModal
