import ChevronIcon from '../../../components/assets/icons/ChevronIcon';
import {BackIconContainer, SettingsHeaderContainer, SettingsHeaderText} from './style';

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
