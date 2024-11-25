import {TCountryCode} from 'countries-list';
import {Text} from 'react-native';
import {Circle, Container, SelectedCircle, SSITextH3RegularLightStyled} from '../../../styles/components';
import {CountryOption} from '../../../types';

type Props = {
  option: CountryOption;
  onSelect: (countryCode: TCountryCode) => void;
};

const CountrySelectOption = ({option, onSelect}: Props) => (
  <Container accessible accessibilityRole="radio" accessibilityState={{selected: option.selected}} onPress={() => onSelect(option.countryCode)}>
    <Text style={{fontSize: 17, marginRight: 10}}>{option.flag}</Text>
    <SSITextH3RegularLightStyled>{option.label}</SSITextH3RegularLightStyled>
    <Circle>{option.selected && <SelectedCircle />}</Circle>
  </Container>
);

export default CountrySelectOption;
