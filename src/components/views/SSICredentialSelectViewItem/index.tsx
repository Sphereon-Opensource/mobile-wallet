import React, {FC} from 'react';
import {TouchableOpacity, ViewStyle} from 'react-native';
import {SSICredentialMiniCardView} from '@sphereon/ui-components.ssi-react-native';
import SSICheckbox from '../../fields/SSICheckbox';
import {
  SSICredentialSelectViewItemCheckboxContainerStyled as CheckboxContainer,
  SSIFlexDirectionRowViewStyled as Container,
  SSICredentialSelectViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectViewItemContentTextContainerStyled as ContentTextContainer,
  SSITextH3LightStyled as CredentialTypeCaption,
  SSITextH4LightStyled as IssuerCaption,
  SSICredentialSelectViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
  SSICredentialSelectViewItemLogoContainerStyled as LogoContainer,
  SSICredentialSelectViewItemLogoOuterContainerStyled as LogoOuterContainer,
} from '../../../styles/components';
import {CredentialMiniCardDisplay} from '../../../types';

export interface Props {
  title: string;
  isSelected: boolean;
  onPress: () => Promise<void>;
  issuer?: string;
  cardDisplay?: CredentialMiniCardDisplay;
  style?: ViewStyle;
}

const SSICredentialSelectViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {cardDisplay, style, title, issuer, onPress} = props;

  return (
    <Container>
      <LogoContainer>
        <LogoOuterContainer>
          <LogoCheckboxContainer>
            <TouchableOpacity onPress={onPress}>
              <SSICredentialMiniCardView
                backgroundColor={cardDisplay?.backgroundColor}
                backgroundImage={cardDisplay?.backgroundImage}
                logoColor={cardDisplay?.logoColor}
                logo={cardDisplay?.logo}
              />
            </TouchableOpacity>
            <CheckboxContainer>
              <SSICheckbox onValueChange={onPress} isChecked={props.isSelected} backgroundColor={style?.backgroundColor} />
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
