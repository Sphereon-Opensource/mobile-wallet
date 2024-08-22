import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SSITextH2SemiBoldLightStyled, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';
import ScreenContainer from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
const {width} = Dimensions.get('window');

const Footer = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const UnorderdItemContainer = styled.View`
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  margin: 5px 0px 0px 5px;
`;

const UnorderedItemText = styled(SSITextH3RegularLightStyled)`
  color: white;
  line-height: 21px;
`;

const UnorderedItemBullet = styled(UnorderedItemText)`
  margin: 0px 5px 0px 0px;
`;

const IncorrectInformationScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);

  const footer = (
    <Footer>
      <PrimaryButton
        style={{height: 42, width: width - 40}}
        caption={translate('incorrect_data_dont_add_info')}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
      />
      <SecondaryButton
        style={{height: 42, width: width - 40}}
        caption={translate('incorrect_data_back')}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS)}
      />
    </Footer>
  );
  return (
    <ScreenContainer footer={footer}>
      <ScreenTitleAndDescription title={translate('incorrect_data_title')} description={translate('incorrect_data_description')} />
      <SSITextH2SemiBoldLightStyled>{translate('incorrect_data_bullet_content_heading')}</SSITextH2SemiBoldLightStyled>
      {translate('incorrect_data_bullet_content')
        .split('\n')
        .map(c => (
          <UnorderdItemContainer key={c} style={{display: 'flex', alignItems: 'flex-start', flexDirection: 'row'}}>
            <UnorderedItemBullet>{'\u2022'}</UnorderedItemBullet>
            <UnorderedItemText>{c}</UnorderedItemText>
          </UnorderdItemContainer>
        ))}
      <SSITextH2SemiBoldLightStyled style={{marginTop: 40}}>{translate('incorrect_data_after_bullet_heading')}</SSITextH2SemiBoldLightStyled>
      <SSITextH3RegularLightStyled>{translate('incorrect_data_after_bullet_content')}</SSITextH3RegularLightStyled>
    </ScreenContainer>
  );
};

export default IncorrectInformationScreen;
