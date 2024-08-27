import {fontColors, statusColors} from '@sphereon/ui-components.core';
import {ColorValue, View, ViewProps} from 'react-native';
import {SSITextH3RegularLightStyled} from '../../../styles/components';

type Requirement = {
  key: string;
  text: string;
  met: boolean;
  showFeedback: boolean;
};

type Props = {
  title: string;
  requirements: Requirement[];
  style?: ViewProps['style'];
};

const Requirement = ({text, met, showFeedback}: Requirement) => {
  const textColor: ColorValue = !met && showFeedback ? statusColors.expired : `${fontColors.light}CC`;
  return (
    <View style={{flexDirection: 'row'}}>
      <SSITextH3RegularLightStyled style={{color: textColor}}>{'  \u2022  '}</SSITextH3RegularLightStyled>
      <SSITextH3RegularLightStyled style={{color: textColor}}>{text}</SSITextH3RegularLightStyled>
    </View>
  );
};

const PinCodeRequirements = ({requirements, title, style = {}}: Props) => {
  return (
    <View style={style}>
      <SSITextH3RegularLightStyled style={{marginBottom: 4}}>{title}</SSITextH3RegularLightStyled>
      {requirements.map(({key, text, met, showFeedback}) => (
        <Requirement key={key} text={text} met={met} showFeedback={showFeedback} />
      ))}
    </View>
  );
};

export default PinCodeRequirements;
