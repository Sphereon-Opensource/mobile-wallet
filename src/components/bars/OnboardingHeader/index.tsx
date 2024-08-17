import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {OnboardingContext} from '../../..//navigation/machines/onboardingStateNavigation';
import ProgressBarIndicator from '../../../components/indicators/ProgressBarIndicator';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  OnboardingHeaderContainerStyled as Container,
  OnboardingHeaderRow as HeaderRow,
  SSITextH3LightStyled,
} from '../../../styles/components';
import {ButtonIconsEnum} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

export interface HeaderBarProps extends NativeStackHeaderProps {
  title?: string;
  stepConfig?: {
    total: number;
    current: number;
  };
}

const OnboardingHeader: FC<HeaderBarProps> = ({title, stepConfig}: HeaderBarProps): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderRow>
        <BackIconContainer style={{flex: 1}}>
          <BackIcon
            style={{marginTop: 0}}
            icon={ButtonIconsEnum.BACK}
            onPress={() => new Promise(() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))}
          />
        </BackIconContainer>
        {title && <SSITextH3LightStyled>{title as string}</SSITextH3LightStyled>}
        {stepConfig && (
          <SSITextH3LightStyled
            style={{
              textAlign: 'right',
              flex: 1,
            }}>
            {`${stepConfig.current}/${stepConfig.total}`}
          </SSITextH3LightStyled>
        )}
      </HeaderRow>
      {stepConfig && <ProgressBarIndicator step={stepConfig.current} stepsNumber={stepConfig.total} containerStyle={{marginVertical: 10}} />}
    </Container>
  );
};

export default OnboardingHeader;
