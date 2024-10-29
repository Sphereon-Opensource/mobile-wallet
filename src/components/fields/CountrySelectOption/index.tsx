import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {Circle, Container, Flag, SelectedCircle} from '../../../styles/components/modals/CountrySelectionModal';
import {CountryOption} from '../../../types';
import {Country} from '../../../types/countries';

type Props = {
  option: CountryOption;
  onSelect: (country: Country) => void;
};

const CountrySelectOption = ({option, onSelect}: Props) => (
  <Container onPress={() => onSelect(option.country)}>
    <Flag source={{uri: option.flagURI}} />
    <SSITextH3RegularLightStyled>{option.label}</SSITextH3RegularLightStyled>
    <Circle>{option.selected && <SelectedCircle />}</Circle>
  </Container>
);

export default CountrySelectOption;
