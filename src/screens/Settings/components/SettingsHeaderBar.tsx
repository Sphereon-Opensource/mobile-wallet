import ChevronIcon from 'src/components/assets/icons/ChevronIcon';
import {BackIconContainer, SettingsHeaderContainer, SettingsHeaderText} from './style';
import {SSITextH3SemiBoldStyled} from '@sphereon/ui-components.ssi-react-native';
import {translate} from '../../../localization/Localization';
import {transform} from '@babel/core';

type SettingsHeaderBarProps = {
  onBack: () => void;
  title?: string;
  showBottomBorder?: boolean;
};
export const SettingsHeaderBar = (props: SettingsHeaderBarProps) => {
  const {onBack, showBottomBorder = true, title} = props;

  return (
    <SettingsHeaderContainer style={{borderBottomColor: '#404D7A', borderBottomWidth: showBottomBorder ? 1 : 0}}>
      <BackIconContainer onPress={onBack} style={({pressed}) => ({transform: [{rotate: '90deg'}], opacity: pressed ? 0.7 : 1})}>
        <ChevronIcon color="white" />
      </BackIconContainer>
      <SettingsHeaderText>{title}</SettingsHeaderText>
    </SettingsHeaderContainer>
  );
};
