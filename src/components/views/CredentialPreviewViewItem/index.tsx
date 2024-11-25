import React, {FC} from 'react';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';
import {
  CredentialPreviewViewItemContainerStyled as Container,
  SSITextH4LightStyled as IssuerCaption,
  SSITextH3LightStyled as TitleCaption,
  CredentialPreviewCredentialCardStyled as CredentialCard,
  CredentialPreviewCredentialContentContainerStyled as CredentialContentContainer,
} from '../../../styles/components';

export interface Props {
  title: string;
  issuer: string;
  branding?: IBasicCredentialLocaleBranding;
}

const CredentialPreviewViewItem: FC<Props> = (props: Props): JSX.Element => {
  const {branding, issuer, title} = props;

  return (
    <Container>
      <CredentialCard backgroundColor={branding?.background?.color} backgroundImage={branding?.background?.image} logo={branding?.logo} />
      <CredentialContentContainer>
        <TitleCaption numberOfLines={2}>{title}</TitleCaption>
        <IssuerCaption>{issuer}</IssuerCaption>
      </CredentialContentContainer>
    </Container>
  );
};

export default CredentialPreviewViewItem;
