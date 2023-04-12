import React, { FC } from 'react'
import { View, ViewStyle } from 'react-native'

import {
  SSIFlexDirectionRowViewStyled as Container,
  SSICredentialSelectTypeViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectTypeViewItemContentTextContainerStyled as ContentTextContainer,
  SSITextH3LightStyled as CredentialTypeCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialSelectTypeViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
  SSICredentialSelectTypeViewItemLogoContainerStyled as LogoContainer,
} from '../../../styles/components';
import SSICredentialLogo from '../../assets/logos/SSICredentialLogo';
import SSICheckbox from '../../fields/SSICheckbox';

export interface Props {
  id: string
  title: string
  issuer?: string
  isSelected: boolean
  image?: string // TODO WAL-302 Support passing in storage location
  style?: ViewStyle
  onLogoPress: () => Promise<void> // TODO fix event issue
}

const SSICredentialSelectViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {image, style, title, issuer, onLogoPress} = props;

  return (
    <Container>
      <LogoContainer>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <View style={{height: 60, width: 80, justifyContent: 'center'}}>
            <SSICredentialLogo image={image}/>
            <LogoCheckboxContainer>
              <SSICheckbox isChecked={props.isSelected} backgroundColor={style?.backgroundColor} />
            </LogoCheckboxContainer>
          </View>
        </View>
      </LogoContainer>
      <ContentContainer>
        <ContentTextContainer>
          <CredentialTypeCaption>{title}</CredentialTypeCaption>
          { issuer &&
              <IssuerCaption>{issuer}</IssuerCaption>
          }
        </ContentTextContainer>
      </ContentContainer>
    </Container>
  );
};

export default SSICredentialSelectViewItem;
