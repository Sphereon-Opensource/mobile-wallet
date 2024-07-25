import {calculateAspectRatio} from '@sphereon/ui-components.core';
import React, {FC} from 'react';
import FastImage from 'react-native-fast-image';

import {
  SSIImageFieldContainerStyled as Container,
  SSIImageFieldContentContainerStyled as ContentContainer,
  SSIImageFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
} from '../../../styles/components';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';

export interface IProps {
  item: CredentialDetailsRow;
  index?: number;
}

// TODO refactor whole component when we start using images more
const SSIImageField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index} = props;
  // TODO fix non-null assertion
  const aspectRatio: number = calculateAspectRatio(item.imageSize!.width, item.imageSize!.height);
  return (
    <Container key={item.id} style={{marginTop: index === 0 ? 16 : 10}}>
      <HeaderContainer style={{marginBottom: 4}}>
        <HeaderLabel>{item.label}</HeaderLabel>
      </HeaderContainer>
      <ContentContainer
        style={{
          aspectRatio,
          height: 150,
        }}>
        <FastImage
          source={{uri: item.value}}
          style={{
            aspectRatio,
            height: 130,
          }}
          resizeMode="contain"
        />
      </ContentContainer>
    </Container>
  );
};

export default SSIImageField;
