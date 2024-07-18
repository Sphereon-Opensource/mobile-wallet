import styled from 'styled-components/native';
import {borderColors} from '@sphereon/ui-components.core';

export const SSITermsOfServiceLinkPressable = styled.Pressable`
  display: flex;
  color: #fbfbfb;
`;

export const SSITermsOfServiceScreenLinkAndTextContainer = styled.View`
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0px 30px;
  margin-bottom: 20px;
`;

export const SSITermsOfServiceScreenLinkContainer = styled(SSITermsOfServiceScreenLinkAndTextContainer)`
  flex-direction: row;
  padding: 0px 0px;
  width: 100%;
  justify-content: center;
  margin-top: 4px;
`;

export const SSITermsOfServiceScreenLinkText = styled.Text`
  color: #fbfbfb;
  text-align: center;
  font-size: 12px;
`;

export const SSITermsOfServiceScreenDescriptionContainerStyled = styled.View`
  display: flex;
  flex: 1;
  align-items: stretch;
  padding: 20px 30px 0px 30px;
`;

export const SSITermsOfServiceScreenDescriptionHeaderStyled = styled.Text`
  color: white;
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
`;

export const SSITermsOfServiceScreenDescriptionTextStyed = styled.Text`
  color: #fbfbfbcc;
  width: 100%;
  font-size: 14px;
  line-height: 21px;
`;

export const SSITermsOfServiceScreenHighlightedLinkText = styled.Text`
  font-weight: 600;
  text-decoration-line: underline;
  color: white;
  font-size: 12px;
`;

export const SSITermsOfServiceScreenTabViewContainerStyled = styled.View`
  flex: 1;
  margin-top: 17px;
`;

export const SSITermsOfServiceScreenBottomContainerStyled = styled.View`
  margin-top: auto;
  border-top-width: 1px;
  border-top-color: ${borderColors.dark};
`;

export const SSITermsOfServiceScreenCheckboxesContainerStyled = styled.View`
  margin: 16px 24px 16px 24px;
`;

export const SSITermsOfServiceScreenCheckboxContainerStyled = styled.View`
  margin-bottom: 14px;
`;
