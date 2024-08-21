import {LinearGradient} from 'expo-linear-gradient';
import {View, ViewProps} from 'react-native';
import styled from 'styled-components/native';
import {SSITextH2SemiBoldLightStyled} from '../../../styles/components';
import SSICheckmarkIcon from '../../assets/icons/SSICheckmarkIcon';

type Feature = string;

type Props = {
  features: Feature[];
  style?: ViewProps['style'];
};

const FeatureDotContainer = styled(LinearGradient).attrs(_ => ({
  colors: ['#4347E1', '#4C16AE'],
  start: {x: 0, y: 1},
  end: {x: 1, y: 1},
}))`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`;

const FeatureDot = () => (
  <FeatureDotContainer>
    <SSICheckmarkIcon color="#FBFBFB" />
  </FeatureDotContainer>
);

const Feature = ({feature}: {feature: Feature}) => (
  <View style={{flexDirection: 'row', gap: 16, alignItems: 'center'}}>
    <FeatureDot />
    <SSITextH2SemiBoldLightStyled>{feature}</SSITextH2SemiBoldLightStyled>
  </View>
);

const TermsAndPrivacyFeatures = ({features, style}: Props) => (
  <View style={[{gap: 32}, style]}>
    {features.map(feature => (
      <Feature key={feature} feature={feature} />
    ))}
  </View>
);

export default TermsAndPrivacyFeatures;
