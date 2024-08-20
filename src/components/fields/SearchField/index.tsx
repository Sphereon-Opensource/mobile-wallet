import React, {FC, ReactElement} from 'react';
import {TouchableWithoutFeedback} from 'react-native';
import {SSITextH2LightStyled as SearchCaption} from '@sphereon/ui-components.ssi-react-native';
import Localization from '../../../localization/Localization';
import {SearchFieldContainerStyled as Container, SearchFieldMagnifyingGlassIconStyled as MagnifyingGlassIcon} from '../../../styles/components';
import {showToast} from '../../../utils';
import {ToastTypeEnum} from '../../../types';

const SearchField: FC = (): ReactElement => {
  const showNotYetImplementedToast = async (): Promise<void> => {
    showToast(ToastTypeEnum.TOAST_SUCCESS, {
      message: Localization.translate('item_not_yet_available_message'),
      showBadge: false,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={showNotYetImplementedToast}>
      <Container>
        <MagnifyingGlassIcon />
        <SearchCaption>{Localization.translate('search_field_default_caption')}</SearchCaption>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default SearchField;
