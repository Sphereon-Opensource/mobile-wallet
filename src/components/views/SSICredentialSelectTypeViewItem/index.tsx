import React, {FC} from 'react';
import {ViewStyle} from 'react-native';
import {SSICredentialMiniCardView} from '@sphereon/ui-components.ssi-react-native';
import SSICheckbox from '../../fields/SSICheckbox';
import {
  SSIFlexDirectionRowViewStyled as Container,
  SSICredentialSelectTypeViewItemContentContainerStyled as ContentContainer,
  SSICredentialSelectTypeViewItemContentTextContainerStyled as ContentTextContainer,
  SSITextH4LightStyled as CredentialTypeCaption,
  SSICredentialSelectTypeViewItemLogoCheckboxContainerStyled as LogoCheckboxContainer,
  SSICredentialSelectTypeViewItemLogoContainerStyled as LogoContainer,
} from '../../../styles/components';
import {CredentialMiniCardDisplay} from '../../../types';

interface Props {
  title: string;
  isSelected: boolean;
  onPress: () => Promise<void>;
  cardDisplay?: CredentialMiniCardDisplay;
  style?: ViewStyle;
}

const SSICredentialSelectTypeViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {cardDisplay, isSelected, style, title, onPress} = props;

  return (
    <Container>
      <LogoContainer>
        <SSICredentialMiniCardView
          backgroundColor={cardDisplay?.backgroundColor}
          backgroundImage={cardDisplay?.backgroundImage}
          logoColor={cardDisplay?.logoColor}
          logo={cardDisplay?.logo}
        />
        <LogoCheckboxContainer>
          <SSICheckbox onValueChange={onPress} isChecked={isSelected} backgroundColor={style?.backgroundColor} />
        </LogoCheckboxContainer>
      </LogoContainer>
      <ContentContainer>
        <ContentTextContainer>
          <CredentialTypeCaption>{title}</CredentialTypeCaption>
        </ContentTextContainer>
      </ContentContainer>
    </Container>
  );
};

export default SSICredentialSelectTypeViewItem;
