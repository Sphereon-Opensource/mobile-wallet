import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {View} from 'react-native';

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
  SSIContactViewItemContactUriCaptionStyled as ContactUriCaption,
  SSIContactViewItemContainerStyled as Container,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemPlaceholderLogoStyled as PlaceholderLogo,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
} from '../../../styles/components';

export interface Props {
  name: string;
  uri?: string;
  roles: Array<CredentialRole>;
}

const SSIContactViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {name, uri, roles} = props;

  return (
    <Container>
      <StatusContainer />
      <LogoContainer>
        <PlaceholderLogo />
      </LogoContainer>
      <View>
        <ContactDetailsContainer>
          <ContactNameCaption>{name}</ContactNameCaption>
          <ContactRolesCaption>{roles.join(', ')}</ContactRolesCaption>
        </ContactDetailsContainer>
        <ContactUriCaption>{uri}</ContactUriCaption>
      </View>
    </Container>
  );
};

export default SSIContactViewItem;
