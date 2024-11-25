import React, {FC, useCallback, useMemo, useRef, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import SSISecurityImage from '../../../../components/assets/images/SSISecurityImage';
import SSIWarningImage from '../../../../components/assets/images/SSIWarningImage';
import {useAccessibility} from '../../../../hooks/useAccessibility';
import {
  SSIPopupCloseButtonContainerStyled as CloseButtonContainer,
  SSIPopupContainerStyled as Container,
  SSIPopupContentContainerStyled as ContentContainer,
  SSIPopupDetailsButtonContainerStyled as DetailsButtonContainer,
  SSIPopupDetailsButtonTextStyled as DetailsButtonText,
  SSIPopupDetailsTextStyled as DetailsText,
  SSIPopupExtraDetailsTextStyled as ExtraDetailsText,
  SSIPopupHeaderContainerStyled as HeaderContainer,
  SSIPopupImageContainerStyled as ImageContainer,
  SSICheckmarkBadgeStyled as SSICheckmarkBadge,
  SSIExclamationMarkBadgeStyled as SSIExclamationMarkBadge,
  SSIPopupTitleBadgeContainerStyled as TitleBadgeContainer,
  SSITextH2SemiBoldStyled as TitleCaption,
  SSIPopupTitleContainerStyled as TitleContainer,
} from '../../../../styles/components';
import {ButtonIconsEnum, IButton, PopupBadgesEnum, PopupImagesEnum} from '../../../../types';
import {parseTextToElement} from '../../../../utils';
import SSIIconButton from '../../../buttons/SSIIconButton';
import SSIButtonsContainer from '../../../containers/SSIButtonsContainer';
import SSITextInputField from '../../../fields/SSITextInputField';

export interface IProps {
  onClose?: () => Promise<void>;
  image?: PopupImagesEnum;
  title?: string;
  titleBadge?: PopupBadgesEnum;
  input?: {
    // TODO temp solution to support input on the modal
    label?: string;
    initialValue?: string;
    placeHolder?: string;
    maxLength?: number;
    onEndEditing?: (value: string) => Promise<void>;
    onValueChange?: (value: string) => Promise<void>;
  };
  details?: string;
  extraDetails?: string;
  detailsButton?: IButton;
  primaryButton?: IButton;
  secondaryButton?: IButton;
  darkMode?: boolean;
}

const SSIPopup: FC<IProps> = (props: IProps): JSX.Element => {
  const {onClose, image, title, titleBadge, details, extraDetails, detailsButton, primaryButton, secondaryButton, darkMode = false, input} = props;
  const [value, setValue] = useState<string | undefined>();
  const {setFocus} = useAccessibility();
  const titleRef = useRef(null);
  const focusOnTitle = useCallback(() => {
    if (titleRef.current) {
      setFocus(titleRef, 200);
    }
  }, [titleRef, setFocus]);
  useFocusEffect(focusOnTitle);
  // FIXME quick hack to make sure the disabled state is recalculated because the component is not getting rerendered
  const isDisabled = useMemo(() => {
    return typeof primaryButton?.disabled === 'function' ? primaryButton.disabled() : primaryButton?.disabled;
  }, [value]); // Add dependencies here
  return (
    <Container
      style={{borderTopColor: 'red', borderTopWidth: 1, backgroundColor: darkMode ? backgroundColors.primaryDark : backgroundColors.primaryLight}}>
      <HeaderContainer>
        {onClose && (
          <CloseButtonContainer>
            <SSIIconButton icon={ButtonIconsEnum.CLOSE} iconColor={darkMode ? fontColors.light : undefined} onPress={onClose} />
          </CloseButtonContainer>
        )}
      </HeaderContainer>
      {image && <ImageContainer>{getImage(image)}</ImageContainer>}
      <ContentContainer>
        {title && (
          <TitleContainer>
            {titleBadge && <TitleBadgeContainer>{getBadge(titleBadge)}</TitleBadgeContainer>}
            <TitleCaption ref={titleRef} style={{color: darkMode ? fontColors.light : undefined}}>
              {title}
            </TitleCaption>
          </TitleContainer>
        )}
        {details && <DetailsText style={{color: darkMode ? fontColors.light : undefined}}>{parseTextToElement(details)}</DetailsText>}
        {extraDetails && <ExtraDetailsText>{parseTextToElement(extraDetails)}</ExtraDetailsText>}
        {detailsButton && (
          <DetailsButtonContainer>
            <TouchableOpacity onPress={detailsButton.onPress}>
              <DetailsButtonText>{detailsButton.caption}</DetailsButtonText>
            </TouchableOpacity>
          </DetailsButtonContainer>
        )}
        {input && (
          <SSITextInputField
            textColor={fontColors.dark}
            autoFocus={true}
            label={input.label}
            maxLength={input.maxLength}
            onChangeText={async value => {
              // FIXME quick hack to make sure the disabled state is recalculated because the component is not getting rerendered
              setValue(value);
              input?.onValueChange?.(value);
            }}
            onEndEditing={input.onEndEditing}
            placeholderValue={input.placeHolder}
            initialValue={input.initialValue}
          />
        )}
      </ContentContainer>
      <SSIButtonsContainer
        style={{paddingLeft: 18, paddingRight: 18, paddingBottom: 16}} // FIXME create a styling component for this or align design with other button placements
        {...(secondaryButton && {
          secondaryButton: {
            caption: secondaryButton.caption,
            onPress: secondaryButton.onPress,
            disabled: secondaryButton.disabled,
            accessibilityLabel: secondaryButton.accessibilityLabel,
          },
        })}
        {...(primaryButton && {
          primaryButton: {
            caption: primaryButton.caption,
            onPress: primaryButton.onPress,
            accessibilityLabel: primaryButton.accessibilityLabel,
            // FIXME quick hack to make sure the disabled state is recalculated because the component is not getting rerendered
            disabled: isDisabled, //primaryButton.disabled
          },
        })}
      />
    </Container>
  );
};

const getBadge = (badge: PopupBadgesEnum): JSX.Element => {
  switch (badge) {
    case PopupBadgesEnum.CHECK_MARK:
      return <SSICheckmarkBadge />;
    case PopupBadgesEnum.EXCLAMATION_MARK:
      return <SSIExclamationMarkBadge />;
    default:
      return <View />;
  }
};

const getImage = (image: PopupImagesEnum): JSX.Element => {
  switch (image) {
    case PopupImagesEnum.SECURITY:
      return <SSISecurityImage />;
    case PopupImagesEnum.WARNING:
      return <SSIWarningImage />;
    default:
      return <View />;
  }
};

export default SSIPopup;
