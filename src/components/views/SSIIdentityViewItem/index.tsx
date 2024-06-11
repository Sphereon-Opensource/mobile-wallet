import {CredentialRole} from '@sphereon/ssi-sdk.data-store';
import React, {FC, ForwardedRef} from 'react';
import {ViewStyle} from 'react-native';

import {
  SSIIdentityViewItemContainerStyled as Container,
  SSIIdentityViewItemContactDetailsContainerStyled as IdentityDetailsContainer,
  SSITextH3LightStyled as NameCaption,
  SSITextH4LightStyled as RolesCaption,
} from '../../../styles/components';

export interface IProps {
  name: string;
  roles: Array<CredentialRole>;
  style?: ViewStyle;
}

const SSIIdentityViewItem: FC<IProps> = React.forwardRef((props: IProps, ref: ForwardedRef<unknown>): JSX.Element => {
  const {name, roles, style} = props;

  return (
    <Container style={style}>
      <IdentityDetailsContainer>
        <NameCaption>{name}</NameCaption>
        <RolesCaption>{roles.join(', ')}</RolesCaption>
      </IdentityDetailsContainer>
    </Container>
  );
});

export default SSIIdentityViewItem;
