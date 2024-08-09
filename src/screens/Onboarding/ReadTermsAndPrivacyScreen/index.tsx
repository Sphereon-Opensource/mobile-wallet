import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {buttonColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';
import {useContext} from 'react';
import {Text, View} from 'react-native';
import {translate} from '../../../localization/Localization';
import {OnboardingContext} from '../../../navigation/machines/onboardingStateNavigation';
import {OnboardingStackParamsList} from '../../../types';
import {OnboardingMachineEvents} from '../../../types/machines/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamsList, 'ReadTermsAndPrivacy'>;

const ReadTermsAndPrivacyScreen = ({
  route: {
    params: {document},
  },
}: Props) => {
  const {onboardingInstance} = useContext(OnboardingContext);
  return (
    <View>
      <Text>{`Reading ${document}`}</Text>
      <PrimaryButton
        style={{height: 42, width: 300}}
        caption={translate('action_back_label')}
        backgroundColors={[buttonColors[100]]}
        captionColor={fontColors.light}
        onPress={() => onboardingInstance.send(OnboardingMachineEvents.PREVIOUS)}
      />
    </View>
  );
};

export default ReadTermsAndPrivacyScreen;
