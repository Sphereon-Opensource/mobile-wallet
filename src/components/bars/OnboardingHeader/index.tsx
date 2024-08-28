import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProgressBarIndicator from '../../../components/indicators/ProgressBarIndicator';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  OnboardingHeaderContainerStyled as Container,
  OnboardingHeaderRow as HeaderRow,
  PROGRESS_BAR_HEIGHT,
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
  onBack?: () => Promise<void>;
}

const PROGRESS_BAR_VERTICAL_MARGIN = 10;

export const PROGRESS_BAR_LAYOUT_HEIGHT = +PROGRESS_BAR_HEIGHT + PROGRESS_BAR_VERTICAL_MARGIN * 2;

const OnboardingHeader: FC<HeaderBarProps> = ({title, stepConfig, onBack}: HeaderBarProps): JSX.Element => {
  const {onboardingInstance} = React.useContext(OnboardingContext);
  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}}>
      <HeaderRow>
        <BackIconContainer style={{flex: 1}}>
          <BackIcon
            style={{marginTop: 0}}
            icon={ButtonIconsEnum.BACK}
            onPress={() => (onBack ? onBack() : onboardingInstance.send(OnboardingMachineEvents.PREVIOUS))}
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
      {stepConfig && (
        <ProgressBarIndicator
          step={stepConfig.current}
          stepsNumber={stepConfig.total}
          containerStyle={{marginVertical: PROGRESS_BAR_VERTICAL_MARGIN}}
        />
      )}
    </Container>
  );
};

export default OnboardingHeader;
