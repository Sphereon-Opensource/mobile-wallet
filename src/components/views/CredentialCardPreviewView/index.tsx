import {SSITextH4Styled as DescriptionCaption, SSITextH3SemiBoldStyled as TitleCaption} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, ReactElement, ReactNode} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {
  CredentialCardPreviewViewImageBackgroundStyled as ImageBackground,
  CredentialCardPreviewViewInformationBorderStyled as InformationBorder,
  CredentialCardPreviewViewInformationContainerStyled as InformationContainer,
  CredentialCardPreviewViewInformationContentContainerStyled as InformationContentContainer,
  CredentialCardPreviewViewLogoStyled as Logo,
} from '../../../styles/components';

// TODO eventually we want to have a preview card for potential credentials a user can acquire. Now this component is just a hardcoded eID card preview

export type Props = {
  title: string;
  description: string;
  issuer: string;
  onPress?: () => Promise<void>;
};

const CredentialCardPreviewView: FC<Props> = (props: Props): ReactElement => {
  const {title, description, issuer, onPress} = props;
  const Wrapper = ({children}: {children: ReactNode}) =>
    onPress ? (
      <TouchableOpacity
        onPress={onPress}
        accessible
        accessibilityRole="imagebutton"
        accessibilityHint="Double tap to add this information to your wallet">
        {children}
      </TouchableOpacity>
    ) : (
      <View accessibilityRole="summary" accessible>
        {children}
      </View>
    );
  return (
    <Wrapper>
      <ImageBackground source={require('../../../assets/images/eIDCartBackground.png')}>
        <Logo />
        <InformationContainer>
          <InformationBorder />
          <InformationContentContainer>
            <View>
              <TitleCaption>{title}</TitleCaption>
              <DescriptionCaption>{description}</DescriptionCaption>
            </View>
            <DescriptionCaption>{issuer}</DescriptionCaption>
          </InformationContentContainer>
        </InformationContainer>
      </ImageBackground>
    </Wrapper>
  );
};

export default CredentialCardPreviewView;
