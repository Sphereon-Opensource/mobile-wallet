import {backgroundColors} from '@sphereon/ui-components.core';
import {useContext} from 'react';
import {TouchableOpacity, View, ViewProps} from 'react-native';
import styled from 'styled-components/native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH4LightStyled, SSITextH4SemiBoldLightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

type Props = ViewProps;

const FooterText = styled(SSITextH4LightStyled)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const LinkText = styled(SSITextH4SemiBoldLightStyled)`
  text-decoration-line: underline;
  text-decoration-color: ${backgroundColors.primaryLight};
`;

const FooterContainer = styled(View)`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const Link = ({text, onPress}: {text: string; onPress: () => void}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <LinkText>{text}</LinkText>
    </TouchableOpacity>
  );
};

const TermsAndPrivacyFooter = (containerProps: Props) => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const translationsPath = 'onboarding_pages.terms_and_privacy.footer';
  return (
    <FooterContainer {...containerProps}>
      <FooterText>{translate(`${translationsPath}.prefix`)} </FooterText>
      <Link onPress={() => onboardingInstance.send(OnboardingMachineEvents.READ_TERMS)} text={translate(`${translationsPath}.links.terms`)} />
      <FooterText> {translate(`${translationsPath}.links.delimiter`)} </FooterText>
      <Link onPress={() => onboardingInstance.send(OnboardingMachineEvents.READ_PRIVACY)} text={translate(`${translationsPath}.links.privacy`)} />
    </FooterContainer>
  );
};

export default TermsAndPrivacyFooter;
