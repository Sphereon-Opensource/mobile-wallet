import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';
import {useContext, useMemo} from 'react';
import {Container, Title, TitleContainer, Text, ContentContainer, ButtonContainer} from '../components/styles';
import {OnboardingContext} from 'src/navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from 'src/types/machines/onboarding';
import {ImportInformationSummary} from '../ImportDataConsentScreen/components/ImportInformationSummary';
import {AusweisRequestedInfoSchema} from '../ImportDataConsentScreen/constants';
import {ScrollableContent} from '../ImportDataConsentScreen/components/styles';
import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const ImportDataFinalScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const data = useMemo(() => AusweisRequestedInfoSchema.map(item => ({...item, data: 'placeholder'})), []);
  return (
    <Container>
      <ScrollableContent>
        <TitleContainer>
          <Title>{translate('import_data_final_step_title')}</Title>
        </TitleContainer>
        <ContentContainer>
          <ImportInformationSummary data={data} />
        </ContentContainer>
      </ScrollableContent>
      <ButtonContainer>
        <PrimaryButton
          style={{height: 42, width: width - 40}}
          caption="Continue"
          backgroundColors={['#7276F7', '#7C40E8']}
          captionColor={fontColors.light}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
        />
        <SecondaryButton
          style={{width: width - 40}}
          caption={translate('import_data_consent_button_decline')}
          borderColors={['#7276F7', '#7C40E8']}
          onPress={() => onboardingInstance.send(OnboardingMachineEvents.SKIP_IMPORT)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default ImportDataFinalScreen;
