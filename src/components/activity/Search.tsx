import {borderColors} from '@sphereon/ui-components.core';
import {View} from 'react-native';
import OnboardingSearchField, {Props as SearchInputProps} from '../fields/OnboardingSearchField';

export type Props = SearchInputProps & {
  search: string;
  onSearchChange: (search: string) => void;
  clearable?: boolean;
};

export const Search = ({search, onSearchChange, clearable = true, ...inputProps}: Props) => (
  <View style={{paddingHorizontal: 24, marginTop: 24, marginBottom: 36}}>
    <OnboardingSearchField
      value={search}
      onChangeText={onSearchChange}
      autoFocus={false}
      containerStyle={{borderColor: borderColors.dark}}
      onClear={clearable ? () => onSearchChange('') : undefined}
      {...inputProps}
    />
  </View>
);
