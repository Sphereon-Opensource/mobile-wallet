import {Circle, Container, SelectedCircle, SSITextH3RegularLightStyled} from '../../../styles/components';
import {CountryOption} from '../../../types';
import {TCountryCode} from 'countries-list';
import {Text} from 'react-native';

type Props = {
  option: CountryOption;
  onSelect: (countryCode: TCountryCode) => void;
};

const CountrySelectOption = ({option, onSelect}: Props) => (
  <Container onPress={() => onSelect(option.countryCode)}>
    <Text style={{fontSize: 17, marginRight: 10}}>{option.flag}</Text>
    <SSITextH3RegularLightStyled>{option.label}</SSITextH3RegularLightStyled>
    <Circle>{option.selected && <SelectedCircle />}</Circle>
  </Container>
);

export default CountrySelectOption;
