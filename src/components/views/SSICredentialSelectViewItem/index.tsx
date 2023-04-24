import React, {FC} from 'react';
import {ViewStyle} from 'react-native';

import {
  SSIFlexDirectionRowViewStyled as Container,
  SSICredentialSelectViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectViewItemContentTextContainerStyled as ContentTextContainer,
  SSITextH3LightStyled as CredentialTypeCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialSelectViewItemCheckboxContainerStyled as CheckboxContainer,
  SSICredentialSelectViewItemLogoContainerStyled as LogoContainer,
  SSICredentialSelectViewItemLogoOuterContainerStyled as LogoOuterContainer,
  SSICredentialSelectViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
} from '../../../styles/components';
import SSICredentialLogo from '../../assets/logos/SSICredentialLogo';
import SSICheckbox from '../../fields/SSICheckbox';

export interface Props {
  hash: string;
  id?: string;
  title: string;
  issuer?: string;
  isSelected: boolean;
  image?: string; // TODO WAL-302 Support passing in storage location
  style?: ViewStyle;
  onLogoPress: () => Promise<void>; // TODO fix event issue
}

const SSICredentialSelectViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {image, style, title, issuer, onLogoPress} = props;

  return (
    <Container>
      <LogoContainer>
        <LogoOuterContainer>
          <LogoCheckboxContainer>
            <SSICredentialLogo image={image} />
            <CheckboxContainer>
              <SSICheckbox isChecked={props.isSelected} backgroundColor={style?.backgroundColor} />
            </CheckboxContainer>
          </LogoCheckboxContainer>
        </LogoOuterContainer>
      </LogoContainer>
      <ContentContainer>
        <ContentTextContainer>
          <CredentialTypeCaption>{title}</CredentialTypeCaption>
          {issuer && <IssuerCaption>{issuer}</IssuerCaption>}
        </ContentTextContainer>
      </ContentContainer>
    </Container>
  );
};

export default SSICredentialSelectViewItem;
