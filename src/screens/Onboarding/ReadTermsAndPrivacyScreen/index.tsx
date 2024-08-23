import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SSITextH2LightStyled, SSITextH2SemiBoldLightStyled} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {View, useWindowDimensions} from 'react-native';
import ScreenContainer, {contentContainerStyle} from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {createTopBarNavigator} from '../../../components/navigators/TopBarNavigator';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingStackParamsList, ReadDocumentParamsList} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import DocumentText from './DocumentText';

type Props = NativeStackScreenProps<OnboardingStackParamsList, 'ReadTermsAndPrivacy'>;

const DocumentTypeNav = createTopBarNavigator<ReadDocumentParamsList>();

const renderLabel = (label: string) => (isFocused: boolean) => {
  const TextComponent = isFocused ? SSITextH2SemiBoldLightStyled : SSITextH2LightStyled;
  return <TextComponent>{translate(label)}</TextComponent>;
};

const SCREEN_CONTAINER_HORIZONTAL_PADDING = contentContainerStyle.paddingHorizontal;

const ReadTermsAndPrivacyScreen = ({
  route: {
    params: {document},
  },
}: Props) => {
  const {width: screenWidth} = useWindowDimensions();
  const translationPath = 'onboarding_pages.read_terms_and_privacy';
  // TODO: have a meaningful source for the date
  // TODO: adjust locale formatting
  const date = 'August 19, 2024';
  const {onboardingInstance} = useContext(OnboardingContext);
  const footer = (
    <PrimaryButton
      style={{height: 42, width: '100%'}}
      caption={translate('action_back_label')}
      captionColor={fontColors.light}
      onPress={() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS)}
    />
  );
  return (
    <ScreenContainer footer={footer} style={{flex: 1}} footerStyle={{paddingTop: 16}}>
      <ScreenTitleAndDescription
        title={translate(`${translationPath}.title`)}
        description={`${translate(`${translationPath}.description`)} ${date}.`}
        containerStyle={{marginBottom: 12}}
        descriptionStyle={{opacity: 0.8}}
      />
      <View style={{flex: 1, position: 'relative'}}>
        <DocumentTypeNav.Navigator
          initialRouteName={document}
          wrapperStyle={{
            position: 'absolute',
            left: -Number(SCREEN_CONTAINER_HORIZONTAL_PADDING),
            top: 0,
            bottom: 0,
            width: screenWidth,
          }}
          tapBarProps={{
            indicatorProportionalWidth: 0.6,
            containerStyle: {marginBottom: 16, paddingHorizontal: 16},
            labels: {
              terms: renderLabel(`${translationPath}.terms.tab_title`),
              privacy: renderLabel(`${translationPath}.privacy.tab_title`),
            },
          }}>
          <DocumentTypeNav.Screen name="terms" component={DocumentText} initialParams={{document: 'terms'}} />
          <DocumentTypeNav.Screen name="privacy" component={DocumentText} initialParams={{document: 'privacy'}} />
        </DocumentTypeNav.Navigator>
      </View>
    </ScreenContainer>
  );
};

export default ReadTermsAndPrivacyScreen;
