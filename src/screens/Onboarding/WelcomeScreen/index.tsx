import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext, useEffect, useState} from 'react';
import {LayoutChangeEvent, Platform, StatusBar, View} from 'react-native';
import Svg from 'react-native-svg';
import WelcomeBackground from '../../../assets/images/welcomeBackground.svg';
import {contentContainerStyle, IOS_EXTRA_BOTTOM_PADDING} from '../../../components/containers/ScreenContainer';
import ScreenTitleAndDescription from '../../../components/containers/ScreenTitleAndDescription';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';
import {readFile} from '../../../services/fileService';
import * as FileSystem from 'expo-file-system';
import {createAgent} from '@veramo/core';
import {StorageAccessFramework} from 'expo-file-system';
import {AnomalyDetection, IAnomalyDetection, LookupLocationResult} from '@sphereon/ssi-sdk.anomaly-detection';

// Size of the assets/images/fitted.svg file
const SVG_ASSET_WIDTH = 375;
const SVG_ASSET_HEIGHT = 484;
const SVG_ASSET_ASPECT_RATIO = SVG_ASSET_WIDTH / SVG_ASSET_HEIGHT;

async function readIntoBuffer(args: {filepath: string}) {
  const {filepath} = {...args};
  try {
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      console.log(FileSystem.documentDirectory + filepath);
      // const callback = (downloadProgress: any) => {
      //   const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
      //   console.log(progress)
      // }
      // const downloadResumable = FileSystem.createDownloadResumable('https://github.com/Sphereon-Opensource/SSI-SDK/blob/7e6a490825d543a6d8487dde0f724d47e22cab4d/packages/anomaly-detection/__tests__/shared/GeoLite2-Country.mmdb',
      //   FileSystem.documentDirectory + 'GeoLite2-Country.mmdb', {}, callback)
      // const { uri } = await downloadResumable.resumeAsync() as FileSystemDownloadResult
      // console.log(`Finished downloading to: ${uri}`)
      const result = await FileSystem.readAsStringAsync(FileSystem.documentDirectory + filepath);
      const db = Buffer.from(result);
      return await createAgent<IAnomalyDetection>({
        plugins: [
          new AnomalyDetection({
            geoIpDB: db,
          }),
        ],
      }).lookupLocation({
        ipOrHostname: 'sphereon.com',
      });
    }
  } catch (e) {
    throw Error(`Cannot read from folder: ${e}`);
  }
}

const WelcomeScreen = () => {
  const {onboardingInstance} = useContext(OnboardingContext);
  const translationPath = 'onboarding_pages.welcome';
  const [svgDimensions, setSVGDimensions] = useState<null | {width: number; height: number}>(null);
  const [result, setResult] = useState<LookupLocationResult | undefined>();
  const isAndroid = Platform.OS === 'android';
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

  useEffect(() => {
    async function readFileAsync() {
      setResult(await readIntoBuffer({filepath: '/GeoLite2-Country.mmdb'}));
    }
    readFileAsync();
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: backgroundColors.primaryDark,
        paddingBottom: 32 + IOS_EXTRA_BOTTOM_PADDING,
      }}>
      {isAndroid && <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />}
      <View style={{flex: 1, overflow: 'hidden'}} onLayout={handleSVGContainerLayout}>
        {svgDimensions && (
          <Svg width={svgDimensions.width} height={svgDimensions.height} viewBox={`0 0 ${SVG_ASSET_WIDTH} ${SVG_ASSET_HEIGHT}`}>
            <WelcomeBackground />
          </Svg>
        )}
      </View>
      <View style={[contentContainerStyle, {marginTop: 24}]}>
        <ScreenTitleAndDescription
          title={translate(`${translationPath}.title`)}
          description={translate(`${translationPath}.description`)}
          titleVariant="h0"
          containerStyle={{gap: 16}}
        />
        <View style={{marginTop: 'auto'}}>
          <PrimaryButton
            style={{height: 42, width: '100%'}}
            caption={translate(`${translationPath}.button_caption`)}
            captionColor={fontColors.light}
            onPress={() => onboardingInstance.send(OnboardingMachineEvents.NEXT)}
          />
        </View>
      </View>
    </View>
  );
};

export default WelcomeScreen;
