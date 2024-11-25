import {useCallback, useEffect, useRef} from 'react';
import {TextProps, View, ViewProps} from 'react-native';
import {AnnounceOptions, useAccessibility} from '../../../hooks/useAccessibility';
import Localization from '../../../localization/Localization';
import {SSITextH0LightStyled, SSITextH1LightStyled, SSITextH2LightStyled} from '../../../styles/components';

type Props = {
  title: string;
  description?: string;
  accessibilityLabel?: string;
  titleVariant?: 'h0' | 'h1';
  containerStyle?: ViewProps['style'];
  titleStyle?: TextProps['style'];
  descriptionStyle?: TextProps['style'];
  accessibilityFocusOnTitle?: boolean;
  accessibilityFocusDelay?: number;
  accessibilityAnnounce?: AnnounceOptions;
};

const ScreenTitleAndDescription = ({
  title,
  description,
  accessibilityLabel,
  titleVariant = 'h1',
  containerStyle = {},
  titleStyle = {},
  descriptionStyle = {},
  accessibilityFocusOnTitle = false,
  accessibilityFocusDelay = 0,
  accessibilityAnnounce,
}: Props) => {
  const TitleComponent = titleVariant === 'h0' ? SSITextH0LightStyled : SSITextH1LightStyled;
  const {setFocus, announce} = useAccessibility();
  const titleRef = useRef(null);
  const focusOnTitle = useCallback(() => {
    if (accessibilityFocusOnTitle && titleRef.current) {
      accessibilityAnnounce && announce(accessibilityAnnounce);
      setFocus(titleRef, accessibilityFocusDelay);
    }
  }, [accessibilityFocusOnTitle, accessibilityFocusDelay, setFocus, titleRef.current]);
  useEffect(focusOnTitle, [focusOnTitle]);
  return (
    <View style={[{gap: 8, marginBottom: 32}, containerStyle]}>
      <TitleComponent
        ref={titleRef}
        accessible
        accessibilityLanguage={Localization.getLocale()}
        style={titleStyle}
        accessibilityLabel={accessibilityLabel}>
        {title}
      </TitleComponent>
      {description && <SSITextH2LightStyled style={descriptionStyle}>{description}</SSITextH2LightStyled>}
    </View>
  );
};

export default ScreenTitleAndDescription;
