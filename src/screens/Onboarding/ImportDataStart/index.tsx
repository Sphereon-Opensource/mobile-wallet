import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {ContentContainer} from '../components/styles';
import EnterEIDPinIcon from 'src/components/assets/icons/EnterEIDPinIcon';

const ImportDataStart = (props?: any) => {
  const {onAccept, onDecline} = props?.route?.params ?? {};

  const {onboardingInstance} = useContext(OnboardingContext);
  const translationsPath = 'onboarding_pages.import_data_consent';
  const footer = (
    <>
      <PrimaryButton
        style={{height: 42, width: '100%'}}
        caption={translate(`import_data_start_action_title`)}
        captionColor={fontColors.light}
        onPress={() => (onAccept ? onAccept() : onboardingInstance.send(OnboardingMachineEvents.NEXT))}
      />
    </>
  );
  return (
    <ScreenContainer footer={footer} footerStyle={{gap: 12}}>
      <ScreenTitleAndDescription title={translate(`import_data_start_title`)} description={translate(`import_data_start_subtitle`)} />
      <ContentContainer>
        <EnterEIDPinIcon />
      </ContentContainer>
    </ScreenContainer>
  );
};

export default ImportDataStart;
