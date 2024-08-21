import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {TermsAndPrivacyFeatures, TermsAndPrivacyFooter} from '../../../components/containers/TermsAndPrivacy';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

const AcceptTermsAndPrivacyScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const translationsPath = 'onboarding_pages.terms_and_privacy';
  const footer = (
    <>
      <TermsAndPrivacyFooter style={{marginTop: 'auto', marginBottom: 24}} />
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate(`${translationsPath}.button_caption`)}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
    </>
  );
  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate(`${translationsPath}.title`)} description={translate(`${translationsPath}.description`)} />
      <TermsAndPrivacyFeatures
        style={{marginTop: 8}}
        features={[
          translate(`${translationsPath}.features.advanced_encryption`),
          translate(`${translationsPath}.features.two_factor_authentication`),
          translate(`${translationsPath}.features.regular_security_audits`),
          translate(`${translationsPath}.features.data_anonymization`),
          translate(`${translationsPath}.features.strict_access_controls`),
        ]}
      />
    </ScreenContainer>
  );
};

export default AcceptTermsAndPrivacyScreen;
