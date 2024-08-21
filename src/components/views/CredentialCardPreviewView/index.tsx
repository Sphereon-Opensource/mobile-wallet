import React, {FC, ReactElement} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {SSITextH3SemiBoldStyled as TitleCaption, SSITextH4Styled as DescriptionCaption} from '@sphereon/ui-components.ssi-react-native';
import {
  CredentialCardPreviewViewImageBackgroundStyled as ImageBackground,
  CredentialCardPreviewViewLogoStyled as Logo,
  CredentialCardPreviewViewInformationContainerStyled as InformationContainer,
  CredentialCardPreviewViewInformationBorderStyled as InformationBorder,
  CredentialCardPreviewViewInformationContentContainerStyled as InformationContentContainer,
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

  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress}>
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
    </TouchableOpacity>
  );
};

export default CredentialCardPreviewView;
