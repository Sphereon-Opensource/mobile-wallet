import React, {FC, ReactElement} from 'react';
import {SSITextH7LightStyled as InactiveLabelText} from '@sphereon/ui-components.ssi-react-native';
import Localization from '../../../localization/Localization';
import {
  FilterBarActiveLabelStyled as ActiveLabel,
  FilterBarContainerStyled as Container,
  FilterBarInactiveLabelStyled as InactiveLabel,
  FilterBarActiveLabelTextStyled as ActiveLabelText,
} from '../../../styles/components';

const FilterBar: FC = (): ReactElement => {
  return (
    <Container>
      <ActiveLabel>
        <ActiveLabelText>{Localization.translate('filter_all_label')}</ActiveLabelText>
      </ActiveLabel>
      <InactiveLabel>
        <InactiveLabelText>{Localization.translate('filter_new_label')}</InactiveLabelText>
      </InactiveLabel>
      <InactiveLabel>
        <InactiveLabelText>{Localization.translate('filter_other_label')}</InactiveLabelText>
      </InactiveLabel>
    </Container>
  );
};

export default FilterBar;
