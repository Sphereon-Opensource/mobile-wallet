import React, {FC} from 'react';
import {TouchableOpacity, View} from 'react-native';

import SSISecurityImage from '../../../../components/assets/images/SSISecurityImage';
import SSIWarningImage from '../../../../components/assets/images/SSIWarningImage';
import {
  SSIPopupButtonsContainerStyled as ButtonsContainer,
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
  SSIPopupTitleContainerStyled as TitleContainer,
} from '../../../../styles/components';
import {SSITextH2SemiBoldStyled as TitleCaption} from '../../../../styles/components';
import {ButtonIconsEnum, IButton, PopupBadgesEnum, PopupImagesEnum} from '../../../../types';
import {parseTextToElement} from '../../../../utils/TextUtils';
import SSIIconButton from '../../../buttons/SSIIconButton';
import {backgroundColors, fontColors} from '@sphereon/ui-components.core';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';

export interface IProps {
  onClose?: () => Promise<void>;
  image?: PopupImagesEnum;
  title?: string;
  titleBadge?: PopupBadgesEnum;
  details?: string;
  extraDetails?: string;
  detailsButton?: IButton;
  primaryButton?: IButton;
  secondaryButton?: IButton;
  darkMode?: boolean;
}

const SSIPopup: FC<IProps> = (props: IProps): JSX.Element => {
  const {onClose, image, title, titleBadge, details, extraDetails, detailsButton, primaryButton, secondaryButton, darkMode = false} = props;

  return (
    <Container style={{backgroundColor: darkMode ? backgroundColors.primaryDark : backgroundColors.primaryLight}}>
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
            <TitleCaption style={{color: darkMode ? fontColors.light : undefined}}>{title}</TitleCaption>
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
      </ContentContainer>
      {/* TODO we use this 2 button structure a lot, we should make a component out of it */}
      {(primaryButton || secondaryButton) && (
        <ButtonsContainer>
          {secondaryButton && (
            <SecondaryButton
              style={{
                height: 42,
                minWidth: 160,
                // Scales the button based on presence of other button
                ...(!primaryButton && {width: '100%'}),
              }}
              caption={secondaryButton.caption}
              onPress={secondaryButton.onPress}
            />
          )}
          {primaryButton && (
            <PrimaryButton
              // Scales the button based on presence of other button
              style={{
                height: 42,
                minWidth: 160,
                ...(!secondaryButton && {width: '100%'}),
              }}
              caption={primaryButton.caption}
              onPress={primaryButton.onPress}
            />
          )}
        </ButtonsContainer>
      )}
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
