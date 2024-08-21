import React, {FC, ReactElement} from 'react';
import {TouchableWithoutFeedback} from 'react-native';
import {SSITextH7LightStyled as InactiveLabelText} from '@sphereon/ui-components.ssi-react-native';
import Localization from '../../../localization/Localization';
import {showToast} from '../../../utils';
import {
  FilterBarActiveLabelStyled as ActiveLabel,
  FilterBarContainerStyled as Container,
  FilterBarInactiveLabelStyled as InactiveLabel,
  FilterBarActiveLabelTextStyled as ActiveLabelText,
} from '../../../styles/components';
import {ToastTypeEnum} from '../../../types';

const FilterBar: FC = (): ReactElement => {
  const labels = [
    {
      active: true,
      text: Localization.translate('filter_all_label'),
    },
    {
      active: false,
      text: Localization.translate('filter_new_label'),
    },
    {
      active: false,
      text: Localization.translate('filter_other_label'),
    },
  ];

  const showNotYetImplementedToast = async (): Promise<void> => {
    showToast(ToastTypeEnum.TOAST_SUCCESS, {
      message: Localization.translate('item_not_yet_available_message'),
      showBadge: false,
    });
  };

  const getLabelElements = (): Array<ReactElement> => {
    return labels.map((label, index) => (
      <TouchableWithoutFeedback key={index} onPress={showNotYetImplementedToast}>
        {label.active ? (
          <ActiveLabel>
            <ActiveLabelText>{label.text}</ActiveLabelText>
          </ActiveLabel>
        ) : (
          <InactiveLabel>
            <InactiveLabelText>{label.text}</InactiveLabelText>
          </InactiveLabel>
        )}
      </TouchableWithoutFeedback>
    ));
  };

  return <Container>{getLabelElements()}</Container>;
};

export default FilterBar;
