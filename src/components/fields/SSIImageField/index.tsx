import {backgroundColors, calculateAspectRatio} from '@sphereon/ui-components.core';
import React, {FC} from 'react';
import {Pressable, View} from 'react-native';
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
  valuesVisible?: boolean;
  onToggleVisibility?: () => void;
}

// TODO refactor whole component when we start using images more
const SSIImageField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index, valuesVisible = true, onToggleVisibility} = props;
  // TODO fix non-null assertion
  const aspectRatio: number = calculateAspectRatio(item.imageSize!.width, item.imageSize!.height);
  return (
    <Pressable key={item.id} onLongPress={onToggleVisibility}>
    <Container style={{marginTop: index === 0 ? 16 : 10, marginLeft: (item.depth ?? 0) * 16}}>
      <HeaderContainer style={{marginBottom: 4}}>
        <HeaderLabel>{item.label}</HeaderLabel>
      </HeaderContainer>
      <ContentContainer
        style={{
          aspectRatio,
          height: 150,
        }}>
        <View style={{position: 'relative', overflow: 'hidden', borderRadius: 4}}>
          <FastImage
            source={{uri: item.value}}
            style={{
              aspectRatio,
              height: 130,
            }}
            resizeMode="contain"
          />
          {!valuesVisible && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: backgroundColors.secondaryDark,
                opacity: 0.98,
                borderRadius: 4,
              }}
            />
          )}
        </View>
      </ContentContainer>
    </Container>
    </Pressable>
  );
};

export default SSIImageField;
