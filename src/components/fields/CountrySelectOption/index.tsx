import {SSITextH3RegularLightStyled} from '../../../styles/components';
import {Circle, Container, Flag, SelectedCircle} from '../../../styles/components/modals/CountrySelectionModal';
import {CountryOption} from '../../../types';
import {Country} from '../../../types/machines/onboarding';

type Props = {
  option: CountryOption;
  onSelect: (country: Country) => void;
};

const CountrySelectOption = ({option, onSelect}: Props) => (
  <Container onPress={() => onSelect(option.name)}>
    <Flag source={{uri: option.flagURI}} />
    <SSITextH3RegularLightStyled style={{textTransform: 'capitalize'}}>{option.name}</SSITextH3RegularLightStyled>
    <Circle>{option.selected && <SelectedCircle />}</Circle>
  </Container>
);

export default CountrySelectOption;
