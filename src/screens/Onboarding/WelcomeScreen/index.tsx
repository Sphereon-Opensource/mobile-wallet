import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useState} from 'react';
import {LayoutChangeEvent, Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import WelcomeBackground from '../../../assets/images/welcomeBackground.svg';
import {contentContainerStyle} from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import Localization, {translate} from '../../../localization/Localization';
import LanguageSelectionModal, {LANGUAGE_FLAGS, LANGUAGE_OPTIONS} from '../../../modals/LanguageSelectionModal';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import ChatButton from '../../../components/chat/ChatButton';

// Size of the assets/images/fitted.svg file
const SVG_ASSET_WIDTH = 375;
const SVG_ASSET_HEIGHT = 484;
const SVG_ASSET_ASPECT_RATIO = SVG_ASSET_WIDTH / SVG_ASSET_HEIGHT;

const WelcomeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const translationPath = 'onboarding_pages.welcome';
  const [svgDimensions, setSVGDimensions] = useState<null | {width: number; height: number}>(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const isAndroid = Platform.OS === 'android';
  const insets = useSafeAreaInsets();
  const handleSVGContainerLayout = (event: LayoutChangeEvent) => {
    event.target.measure((_, __, width, height) => {
      if (typeof width !== 'number' || typeof height !== 'number') {
        return;
      }
      const containerAspectRatio = width / height;
      if (containerAspectRatio < SVG_ASSET_ASPECT_RATIO) {
        setSVGDimensions({width: height * SVG_ASSET_ASPECT_RATIO, height});
      } else {
        setSVGDimensions({width, height: width / SVG_ASSET_ASPECT_RATIO});
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: backgroundColors.primaryDark,
        paddingBottom: Math.max(32, insets.bottom),
      }}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <TouchableOpacity
        onPress={() => setIsLanguageModalOpen(true)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={translate('settings_language_section_label')}
        style={{position: 'absolute', top: insets.top + 12, right: 16, zIndex: 1, padding: 8}}>
        <Text style={{fontSize: 32}}>{LANGUAGE_FLAGS[Localization.getLocale()] ?? LANGUAGE_FLAGS.en}</Text>
      </TouchableOpacity>
      <View style={{flex: 1, overflow: 'hidden'}} onLayout={handleSVGContainerLayout}>
        {svgDimensions && (
          <Svg width={svgDimensions.width} height={svgDimensions.height} viewBox={`0 0 ${SVG_ASSET_WIDTH} ${SVG_ASSET_HEIGHT}`}>
            <WelcomeBackground />
          </Svg>
        )}
      </View>
      <View style={[contentContainerStyle, {marginTop: 20}]}>
        <ScreenTitleAndDescription
          title={translate(`${translationPath}.title`)}
          description={translate(`${translationPath}.description`)}
          titleVariant="h1"
          containerStyle={{gap: 14}}
          accessibilityFocusOnTitle
        />
        <View style={{marginTop: 'auto'}}>
          <PrimaryButton
            accessibilityRole="button"
            accessibilityHint="Start the onboarding process"
            caption={translate(`${translationPath}.button_caption`)}
            captionColor={fontColors.light}
            onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
          />
        </View>
      </View>
      <LanguageSelectionModal
        open={isLanguageModalOpen}
        selected={selectedLanguage}
        options={LANGUAGE_OPTIONS}
        onClose={() => setIsLanguageModalOpen(false)}
        onSelect={(language: string | null) => {
          setSelectedLanguage(language);
          Localization.setI18nConfig(language);
          onboardingInstance.send(OnboardingMachineEvents.SET_LANGUAGE, {data: language});
        }}
      />
    </View>
  );
};

export default WelcomeScreen;
