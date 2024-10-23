import React, {FC} from 'react';
import SSIProgressIndicator from '../../indicators/SSIProgressIndicator';
import SSIButtonsContainer from '../../containers/SSIButtonsContainer';
import {translate} from '../../../localization/Localization';
import {
  SSIWelcomeViewBodyContainerStyled as BodyContainer,
  SSITextH3RegularLightStyled as BodyText,
  SSIWelcomeViewContainerStyled as Container,
  SSIWelcomeViewContentContainerStyled as ContentContainer,
  SSIWelcomeViewHeaderTextStyled as HeaderCaption,
  SSIWelcomeViewProgressIndicatorContainerStyled as ProgressIndicatorContainer,
  SSIWelcomeViewTitleTextStyled as TitleCaption,
} from '../../../styles/components';
import {IButton} from '../../../types';

export interface IProps {
  step: number;
  maxSteps: number;
  header: string;
  title: string;
  body: string;
  action: IButton;
}

const SSIWelcomeView: FC<IProps> = (props: IProps): JSX.Element => {
  const {action, body, header, step, title, maxSteps} = props;

  return (
    <Container>
      <ProgressIndicatorContainer>
        <SSIProgressIndicator step={step} maxSteps={maxSteps} />
      </ProgressIndicatorContainer>
      <ContentContainer>
        <HeaderCaption>{header}</HeaderCaption>
        <TitleCaption>{title}</TitleCaption>
        <BodyContainer>
          <BodyText>{body}</BodyText>
        </BodyContainer>
      </ContentContainer>
      <SSIButtonsContainer
        primaryButton={{
          caption: translate('action_accept_label'),
          onPress: action.onPress,
        }}
      />
    </Container>
  );
};

export default SSIWelcomeView;
