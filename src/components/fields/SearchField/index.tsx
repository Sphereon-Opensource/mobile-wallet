import React, {FC, ReactElement} from 'react';
import {SSITextH2LightStyled as SearchCaption} from '@sphereon/ui-components.ssi-react-native';
import Localization from '../../../localization/Localization';
import {SearchFieldContainerStyled as Container, SearchFieldMagnifyingGlassIconStyled as MagnifyingGlassIcon} from '../../../styles/components';

const SearchField: FC = (): ReactElement => {
  return (
    <Container>
      <MagnifyingGlassIcon />
      <SearchCaption>{Localization.translate('search_field_default_caption')}</SearchCaption>
    </Container>
  );
};

export default SearchField;
