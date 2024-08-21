import {TextProps, View, ViewProps} from 'react-native';
import {SSITextH0LightStyled, SSITextH1LightStyled, SSITextH2LightStyled} from '../../../styles/components';

type Props = {
  title: string;
  description?: string;
  titleVariant?: 'h0' | 'h1';
  containerStyle?: ViewProps['style'];
  titleStyle?: TextProps['style'];
  descriptionStyle?: TextProps['style'];
};

const ScreenTitleAndDescription = ({title, description, titleVariant = 'h1', containerStyle = {}, titleStyle = {}, descriptionStyle = {}}: Props) => {
  const TitleComponent = titleVariant === 'h0' ? SSITextH0LightStyled : SSITextH1LightStyled;
  return (
    <View style={[{gap: 8, marginBottom: 32}, containerStyle]}>
      <TitleComponent style={titleStyle}>{title}</TitleComponent>
      {description && <SSITextH2LightStyled style={descriptionStyle}>{description}</SSITextH2LightStyled>}
    </View>
  );
};

export default ScreenTitleAndDescription;
