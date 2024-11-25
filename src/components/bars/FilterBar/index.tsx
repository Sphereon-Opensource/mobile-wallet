import {SSITextH7LightStyled as InactiveLabelText} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, ReactElement} from 'react';
import {TouchableWithoutFeedback} from 'react-native';
import Localization from '../../../localization/Localization';
import {
  FilterBarActiveLabelStyled as ActiveLabel,
  FilterBarActiveLabelTextStyled as ActiveLabelText,
  FilterBarContainerStyled as Container,
  FilterBarInactiveLabelStyled as InactiveLabel,
} from '../../../styles/components';
import {ToastTypeEnum} from '../../../types';
import {showToast} from '../../../utils';

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
      <TouchableWithoutFeedback key={index} onPress={showNotYetImplementedToast} accessible={false} importantForAccessibility="no">
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

  return (
    <Container
      accessible
      accessibilityRole="tablist"
      accessibilityHint={Localization.translate('item_not_yet_available_message')}
      accessibilityState={{disabled: true}}>
      {getLabelElements()}
    </Container>
  );
};

export default FilterBar;
