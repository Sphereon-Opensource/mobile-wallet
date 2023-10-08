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

export interface Props {
  title: string;
  isSelected: boolean;
  image?: string;
  style?: ViewStyle;
  onPress: () => Promise<void>;
}

const SSICredentialSelectTypeViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {image, style, title, onPress} = props;

  return (
    <Container>
      <LogoContainer>
        <SSICredentialMiniCardView backgroundImage={{uri: image}} />
        <LogoCheckboxContainer>
          <SSICheckbox onValueChange={onPress} isChecked={props.isSelected} backgroundColor={style?.backgroundColor} />
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
