import { LinearGradient } from 'expo-linear-gradient'
import { Animated, Dimensions, FlatList, StatusBar, TouchableOpacity, View } from 'react-native'
import Ripple from 'react-native-material-ripple'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { SwipeRow } from 'react-native-swipe-list-view'
import styled, { css } from 'styled-components/native'

import { IHeaderProps } from '../@types'
import EntityIcon from '../assets/icons/entity.svg'
import ErrorIcon from '../components/assets/badges/SSIExclamationMarkBadge'
import SSIIconButton from '../components/buttons/SSIIconButton'

import { alerts, backgrounds, borders, fonts, highLightGradients, highlights } from './colors'
import { fontStyle } from './typography'

const dimensions = Dimensions.get('window')

// TODO think about how to handle styling props on custom components. Would be nice if we could control the outer container at least (for placement so we do not need another view for it)

// FONTS
export const SSITextH0Styled = styled.Text`
  font-family: ${fontStyle.h0SemiBold.fontFamily};
  font-size: ${fontStyle.h0SemiBold.fontSize}px;
  font-weight: ${fontStyle.h0SemiBold.fontWeight};
  line-height: ${fontStyle.h0SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH0LightStyled = styled(SSITextH0Styled)`
  color: ${fonts.light};
`

export const SSITextH1Styled = styled.Text`
  font-family: ${fontStyle.h1SemiBold.fontFamily};
  font-size: ${fontStyle.h1SemiBold.fontSize}px;
  font-weight: ${fontStyle.h1SemiBold.fontWeight};
  line-height: ${fontStyle.h1SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH1LightStyled = styled(SSITextH1Styled)`
  color: ${fonts.light};
`

export const SSITextH2Styled = styled.Text`
  font-family: ${fontStyle.h2Regular.fontFamily};
  font-size: ${fontStyle.h2Regular.fontSize}px;
  font-weight: ${fontStyle.h2Regular.fontWeight};
  line-height: ${fontStyle.h2Regular.lineHeight}px;
  height: auto;
`

export const SSITextH2SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h2SemiBold.fontFamily};
  font-size: ${fontStyle.h2SemiBold.fontSize}px;
  font-weight: ${fontStyle.h2SemiBold.fontWeight};
  line-height: ${fontStyle.h2SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH2LightStyled = styled(SSITextH2Styled)`
  color: ${fonts.light};
`

export const SSITextH2DarkStyled = styled(SSITextH2Styled)`
  color: ${fonts.dark};
`

export const SSITextH2SecondaryButtonStyled = styled(SSITextH2Styled)`
  color: ${fonts.secondaryButton};
`

export const SSITextH3Styled = styled.Text`
  font-family: ${fontStyle.h3SemiBold.fontFamily};
  font-size: ${fontStyle.h3SemiBold.fontSize}px;
  font-weight: ${fontStyle.h3SemiBold.fontWeight};
  line-height: ${fontStyle.h3SemiBold.lineHeight}px;
  height: 19px;
`

export const SSITextH3LightStyled = styled(SSITextH3Styled)`
  color: ${fonts.light};
`

export const SSITextH3AnimatedStyled = styled(Animated.Text)`
  font-family: ${fontStyle.h3SemiBold.fontFamily};
  font-size: ${fontStyle.h3SemiBold.fontSize}px;
  font-weight: ${fontStyle.h3SemiBold.fontWeight};
  line-height: ${fontStyle.h3SemiBold.lineHeight}px;
  height: 19px;
`

export const SSITextH3AnimatedLightStyled = styled(SSITextH3AnimatedStyled)`
  color: ${fonts.light};
`

export const SSITextH4Styled = styled.Text`
  font-family: ${fontStyle.h4Regular.fontFamily};
  font-size: ${fontStyle.h4Regular.fontSize}px;
  font-weight: ${fontStyle.h4Regular.fontWeight};
  line-height: ${fontStyle.h4Regular.lineHeight}px;
  height: auto;
`

export const SSITextH4SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h4SemiBold.fontFamily};
  font-size: ${fontStyle.h4SemiBold.fontSize}px;
  font-weight: ${fontStyle.h4SemiBold.fontWeight};
  line-height: ${fontStyle.h4SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH4LightStyled = styled(SSITextH4Styled)`
  color: ${fonts.light};
`

export const SSITextH4DarkStyled = styled(SSITextH4Styled)`
  color: ${fonts.dark};
`

export const SSITextH4SemiBoldLightStyled = styled(SSITextH4SemiBoldStyled)`
  color: ${fonts.light};
`

export const SSITextH5Styled = styled.Text`
  font-family: ${fontStyle.h5Regular.fontFamily};
  font-size: ${fontStyle.h5Regular.fontSize}px;
  font-weight: ${fontStyle.h5Regular.fontWeight};
  line-height: ${fontStyle.h5Regular.lineHeight}px;
  height: auto;
`

export const SSITextH5LightStyled = styled(SSITextH5Styled)`
  color: ${fonts.light};
`

export const SSITextH5SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h5SemiBold.fontFamily};
  font-size: ${fontStyle.h5SemiBold.fontSize}px;
  font-weight: ${fontStyle.h5SemiBold.fontWeight};
  line-height: ${fontStyle.h5SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH5LightSemiBoldStyled = styled(SSITextH5SemiBoldStyled)`
  color: ${fonts.light};
`

export const SSITextH6Styled = styled.Text`
  font-family: ${fontStyle.h6.fontFamily};
  font-size: ${fontStyle.h6.fontSize}px;
  font-weight: ${fontStyle.h6.fontWeight};
  line-height: ${fontStyle.h6.lineHeight}px;
  height: auto;
`

export const SSITextH6LightStyled = styled(SSITextH6Styled)`
  color: ${fonts.light};
`

export const SSITextH7SemiBoldStyled = styled.Text`
  font-family: ${fontStyle.h7SemiBold.fontFamily};
  font-size: ${fontStyle.h7SemiBold.fontSize}px;
  font-weight: ${fontStyle.h7SemiBold.fontWeight};
  line-height: ${fontStyle.h7SemiBold.lineHeight}px;
  height: auto;
`

export const SSITextH7SemiBoldLightStyled = styled(SSITextH7SemiBoldStyled)`
  color: ${fonts.light};
`

// CSS
export const SSIRoundedEdgesCss = css`
  border-radius: 8px;
`

export const SSIBackgroundPrimaryDarkColorCss = css`
  background-color: ${backgrounds.primaryDark};
`

export const SSIBackgroundSecondaryDarkColorCss = css`
  background-color: ${backgrounds.secondaryDark};
`

export const SSIBackgroundPrimaryLightColorCss = css`
  background-color: ${backgrounds.primaryLight};
`

export const SSIButtonBottomContainerCss = css`
  bottom: 37px;
  position: absolute;
  align-items: center;
`

// CONTAINERS (These should not contain any properties that changes the placement of the container e.g. margin. If you need specific properties, then extend the container element)
export const SSIFlexDirectionRowViewStyled = styled.View`
  flex-direction: row;
`

export const SSIFlexDirectionColumnViewStyled = styled.View`
  flex-direction: column;
`

export const SSIFullFlexDirectionRowViewStyled = styled(SSIFlexDirectionRowViewStyled)`
  flex: 1;
`

export const SSIFlexDirectionColumnHalfViewStyled = styled(SSIFlexDirectionColumnViewStyled)`
  width: 45%;
`

export const SSIBasicContainerStyled = styled.View`
  flex: 1;
  ${SSIBackgroundPrimaryDarkColorCss};
`

export const SSIBasicModalContainerStyled = styled.View`
  flex: 1;
  background-color: 'rgba(16,16,16,0.5)';
`

export const SSIModalContentContainerStyled = styled.View`
  margin-top: auto;
  margin-bottom: 14px;
  padding-left: 6px;
  padding-right: 6px;
  width: 100%;
`

export const SSIPopupModalContentContainerStyled = styled.View`
  margin-top: auto;
  margin-bottom: 6px;
  padding-left: 6px;
  padding-right: 6px;
  width: 100%;
`

export const SSIBasicHorizontalCenterContainerStyled = styled(SSIBasicContainerStyled)`
  align-items: center;
`

export const SSIRoundedContainerStyled = styled.View`
  ${SSIRoundedEdgesCss};
  overflow: hidden;
`

export const SSIRoundedContainerBackgroundSecondaryDarkStyled = styled(SSIRoundedContainerStyled)`
  ${SSIRoundedEdgesCss};
  ${SSIBackgroundSecondaryDarkColorCss};
`

export const SSIRoundedContainerBackgroundPrimaryLightStyled = styled(SSIRoundedContainerStyled)`
  ${SSIRoundedEdgesCss};
  ${SSIBackgroundPrimaryLightColorCss};
`

export const SSIRippleContainerStyled = styled(Ripple).attrs({
  // TODO fix react-native-material-ripple package to start ripple effect on PressIn. Currently it only starts the effect when you release.
  // A fork was made to fix this (works) https://github.com/vjsingh/react-native-material-ripple
  // this commit fixes it https://github.com/vjsingh/react-native-material-ripple/commit/12e8f8d872ee780caa94e7de8080701e67dc6a9a

  // displayUntilPressOut: false, // TODO currently not implemented in latest version
  rippleSequential: false,
  rippleColor: highlights.dark,
  rippleCentered: true,
  rippleFades: false
})``

export const SSICredentialsViewItemContentContainerStyled = styled(SSIRippleContainerStyled)`
  padding-right: 21px;
  padding-left: 24px;
  padding-top: 16px;
  padding-bottom: 18px;
`

export const SSIHeaderBarContainerStyled = styled(View)`
  ${SSIBackgroundPrimaryDarkColorCss};
  border-bottom-color: ${borders.dark};
  border-bottom-width: ${(props: IHeaderProps) => (props.showBorder ? '1px' : '0px')};
`

// GRADIENTS
export const SSILinearGradientStyled = styled(LinearGradient).attrs({
  colors: [highLightGradients['100'].secondaryColor, highLightGradients['100'].primaryColor],
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 }
})``

export const SSIRoundedLinearGradient = styled(SSILinearGradientStyled)`
  ${SSIRoundedEdgesCss}
`

export const SSIRoundedCenteredSecondaryButtonStyled = styled(SSIRoundedContainerStyled)`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${backgrounds.primaryDark};
`

// BUTTONS
export const SSINavigationBarButtonStyled = styled(TouchableOpacity)`
  flex: 1;
  align-items: center;
`

export const SSISwipeDeleteButtonCaptionStyled = styled(SSITextH4LightStyled)`
  margin-top: 14px;
`

export const SSISwipeDeleteButtonLinearGradientStyled = styled(SSILinearGradientStyled)`
  height: 97px;
  width: 97px;
  padding-top: 30px;
  align-items: center;
`

export const SSITouchableOpacityButtonFlexRowStyled = styled(TouchableOpacity)`
  flex-direction: row;
`

export const SSIRoundedCenteredLinearGradientStyled = styled(SSIRoundedLinearGradient)`
  align-items: center;
  justify-content: center;
`

export const SSIRoundedCenteredLinearGradientSecondaryButtonStyled = styled(SSIRoundedCenteredLinearGradientStyled)`
  padding: 1.2px;
`

// TODO fix not working styling
// export const SSIPrimaryButtonStyled = styled(SSIPrimaryButton).attrs({
//   style: {flex: 1, height: 42},
// })``;

// ICONS
export const SSIHeaderBarEntityIconStyled = styled(EntityIcon)`
  margin-left: auto;
  margin-right: 25px;
  margin-top: 7px;
`

export const SSIMoreIconStyled = styled(SSIIconButton)`
  margin-right: 25px;
  margin-top: 35px;
  margin-left: auto;
  margin-bottom: 14px;
`

export const SSIBackIconStyled = styled(SSIIconButton)`
  margin-top: 18px;
  margin-left: 24px;
`

export const SSIToastErrorIconStyled = styled(ErrorIcon).attrs({
  size: 13
})`
  margin-top: 1px;
`

// MISC
// TEXT
export const SSICredentialsViewItemExpirationDateCaptionStyled = styled(SSITextH5LightStyled)`
  margin-left: auto;
`

export const SSIHeaderBarHeaderCaptionStyled = styled(SSITextH1LightStyled)`
  margin-left: 24px;
`

export const SSIHeaderBarHeaderSubCaptionStyled = styled(SSITextH4LightStyled)`
  margin-left: 24px;
  margin-bottom: 14px;
`

export const SSIDetailsViewDetailsValueCaptionStyled = styled(SSITextH5LightSemiBoldStyled)`
  color: ${fonts.light};
  height: auto;
`

export const SSIDetailsViewCaptionDetailsStyled = styled(SSITextH5LightSemiBoldStyled)`
  margin-bottom: 9px;
`

export const SSIPexMessageTitleStyled = styled(SSITextH4LightStyled)`
  margin-top: 40px;
`

export const SSIPexMessageStyled = styled(SSITextH4LightStyled)`
  flex: 1;
  flex-shrink: 1;
  flex-wrap: wrap;
  text-align: center;
`

// CONTAINERS
export const SSICredentialsViewItemContentTopContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 2px;
`

export const SSICredentialsViewItemContentMiddleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 13px;
`

export const SSINavigationBarContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  align-items: center;
  height: 53px;
  ${SSIBackgroundPrimaryDarkColorCss};
  border-top-color: ${borders.dark};
  border-top-width: 1px;
`

export const SSICredentialsOverviewScreenHiddenItemContainerStyled = styled.View`
  align-items: flex-end;
  height: 100%;
`

export const SSIRightColumnRightAlignedContainerStyled = styled(SSIFlexDirectionColumnViewStyled)`
  margin-left: auto;
`

// TODO fix style issue being an array when using styled component
export const SSICredentialsViewItemSwipeRowContainerStyled = styled(SwipeRow).attrs({
  rightOpenValue: -97,
  stopRightSwipe: -97
})``

export const SSIDetailsViewLabelRowViewStyled = styled(SSIFlexDirectionRowViewStyled)`
  margin-bottom: 9px;
`

export const SSIDetailsViewRoundedContainerStyled = styled(SSIRoundedContainerBackgroundSecondaryDarkStyled)`
  max-height: 75%;
  width: 86.67%;
  margin-top: 10px;
  padding-top: 16px;
  padding-left: 17px;
  padding-right: 17px;
`

export const SSIDetailsLabelsContainerStyled = styled.View`
  padding-top: 16px;
  height: 170px;
`

export const SSIButtonBottomSingleContainerStyled = styled(SSIFlexDirectionColumnViewStyled)`
  ${SSIButtonBottomContainerCss};
  width: 80%;
`

export const SSIButtonBottomMultipleContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  ${SSIButtonBottomContainerCss};
  width: 80%;
  justify-content: center;
`

export const SSIPexMessageContainerStyled = styled(View)`
  margin-top: 20px;
  justify-content: center;
  align-items: center;
  margin-horizontal: 46px;
`

export const SSIPexBackgroundImageContainerStyled = styled(View)`
  margin-top: 150px;
`

// OTHERS
export const SSICredentialsViewItemStatusCaptionStyled = styled.View`
  margin-top: 3px;
  margin-left: auto;
`

export const SSIDetailsViewSeparatorStyled = styled.View`
  border-bottom-width: 1px;
  padding-bottom: 5px;
  border-bottom-color: #404d7a;
`

// TODO check this margin
export const SSIDetailsViewDetailsListStyled = styled(FlatList)`
  margin-bottom: 12px;
`
// ;   max-height: 55%;
export const SSIQRCodeScannerStyled = styled(QRCodeScanner).attrs({
  cameraStyle: {
    height: '100%',
    width: '100%'
  }
})``

export const SSIQRReaderContentContainer = styled.View`
  flex-grow: 2;
  max-width: 80%;
`

export const SSIQRReaderTopContainerStyled = styled.View`
  flex-grow: 2;
  background-color: rgba(0, 0, 0, 0.44);
  justify-content: flex-end;
  padding-bottom: 32px;
`

export const SSIQRReaderBottomContainerStyled = styled.View`
  flex-grow: 3;
  background-color: rgba(0, 0, 0, 0.44);
`

export const SSIQRReaderMarkerStyled = styled.View`
  width: ${dimensions.width * 0.8}px;
  height: ${dimensions.width * 0.8}px;
  border-color: #2a3046;
  border-width: 2px;
  border-radius: 12px;
`

export const SSIQRReaderSideSpaceStyled = styled(View)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.44);
`

export const SSIAlertContainerStyled = styled(SSIRoundedContainerStyled)`
  margin-bottom: 10px;
`

export const SSIAlertMessageContainerStyled = styled(View)`
  justify-content: center;
  align-items: center;
  background-color: ${alerts.primaryLight};
  padding-left: 28px;
  padding-right: 28px;
`

export const SSIAlertMessageTextStyled = styled(SSITextH4DarkStyled)`
  text-align: center;
  margin-top: 14px;
  margin-bottom: 17px;
  height: 31px;
`

export const SSIAlertButtonContainerStyled = styled(SSIFlexDirectionRowViewStyled)`
  height: 48px;
  display: flex;
  flex-wrap: wrap;
  background-color: ${alerts.secondaryLight};
`

export const SSIAlertButtonStyled = styled(SSITouchableOpacityButtonFlexRowStyled)`
  background-color: ${alerts.secondaryLight};
  flex: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
`

export const SSIAlertToastContainerStyled = styled(SSIRoundedContainerStyled)`
  width: 96.8%;
  background-color: ${alerts.secondaryLight};
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  padding-top: 18px;
  padding-bottom: 15px;
  padding-left: 18px;
  padding-right: 18px;
  flex-direction: row;
`

export const SSIAlertToastIconContainerStyled = styled(View)`
  height: 100%;
  margin-left: 0px;
  margin-right: 5px;
`

export const SSIAlertToastMessageTextStyled = styled(SSITextH4DarkStyled)`
  text-align: center;
  height: 100%;
`

export const SSIPexVerificationSpacerStyled = styled(View)`
  width: 5.45px;
`

export const SSIStatusBarDarkModeStyled = styled(StatusBar).attrs({
  backgroundColor: backgrounds.primaryDark
})``

export const SSIPinCodeSegmentTextContainerStyled = styled(View)`
  width: 44px;
  height: 48px;
  margin-top: auto;
  margin-bottom: 2px;
`

export const SSIPinCodeSegmentTextStyled = styled(SSITextH0LightStyled)`
  text-align: center;
`

export const SSIPinCodeSegmentUnderlineLinearGradientStyled = styled(SSILinearGradientStyled)`
  width: 44px;
  height: 2px;
`

export const SSIPinCodeSegmentUnderlineAnimatedStyled = styled(Animated.View)`
  width: 44px;
  height: 2px;
`
export const SSIPinCodeSpacerStyled = styled.View`
  margin-top: 83px;
`
