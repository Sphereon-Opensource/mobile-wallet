import React, {FC} from 'react';

import {
  SSIImageFieldContainerStyled as Container,
  SSIImageFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
  SSIImageFieldContentContainerStyled as ContentContainer,
} from '../../../styles/components';
import {ICredentialDetailsRow, IImageSize} from '../../../types';
import {Image} from 'react-native';
import {scaleImageToMaxHeight} from '../../../utils/ImageUtils';

export interface IProps {
  item: ICredentialDetailsRow;
  index?: number;
}

// TODO refactor whole component when we start using images more
const SSIImageField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index} = props;
  const maxHeight = 130;
  // TODO fix non-null assertion
  const scaledSize: IImageSize = scaleImageToMaxHeight(item.imageSize!.width, item.imageSize!.height, maxHeight);
  return (
    <Container key={item.id} style={{marginTop: index === 0 ? 16 : 10}}>
      <HeaderContainer style={{marginBottom: 4}}>
        <HeaderLabel>{item.label}</HeaderLabel>
      </HeaderContainer>
      <ContentContainer style={{width: scaledSize.width + 20}}>
        <Image source={{uri: item.value}} style={{height: scaledSize.height, width: scaledSize.width}} resizeMode="contain" />
      </ContentContainer>
    </Container>
  );
};

export default SSIImageField;
