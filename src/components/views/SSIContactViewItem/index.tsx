import {CredentialRole, IImageAttributes} from '@sphereon/ssi-sdk.data-store';
import React, {FC} from 'react';
import {View} from 'react-native';

import {
  SSIContactViewItemContactDetailsContainerStyled as ContactDetailsContainer,
  SSITextH3LightStyled as ContactNameCaption,
  SSITextH4LightStyled as ContactRolesCaption,
  SSIContactViewItemContactUriCaptionStyled as ContactUriCaption,
  SSIContactViewItemContainerStyled as Container,
  SSIContactViewItemLogoContainerStyled as LogoContainer,
  SSIContactViewItemNewStatusContainerStyled as StatusContainer,
} from '../../../styles/components';
import Debug, {Debugger} from 'debug';
import {APP_ID} from '../../../@config/constants';
import {SSILogo as Logo} from '@sphereon/ui-components.ssi-react-native';

const debug: Debugger = Debug(`${APP_ID}:SSIContactViewItem`);

export interface Props {
  name: string;
  uri?: string;
  logo?: IImageAttributes;
  roles: Array<CredentialRole>;
}

const SSIContactViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {name, uri, roles, logo} = props;
  debug(`logo: ${logo ? JSON.stringify(logo) : ''}`);
  return (
    <Container>
      <StatusContainer />
      <LogoContainer>
        <Logo logo={logo} />
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
