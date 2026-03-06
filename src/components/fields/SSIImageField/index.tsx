import {backgroundColors, calculateAspectRatio, fontColors} from '@sphereon/ui-components.core';
import React, {FC, useState} from 'react';
import {Dimensions, Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

import {
  SSIImageFieldContainerStyled as Container,
  SSIImageFieldContentContainerStyled as ContentContainer,
  SSIImageFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
} from '../../../styles/components';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {translate} from '../../../localization/Localization';

export interface IProps {
  item: CredentialDetailsRow;
  index?: number;
  valuesVisible?: boolean;
  onToggleVisibility?: () => void;
}

const SSIImageField: FC<IProps> = (props: IProps): JSX.Element => {
  const {item, index, valuesVisible = true, onToggleVisibility} = props;
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const aspectRatio: number = calculateAspectRatio(item.imageSize!.width, item.imageSize!.height);
  const screen = Dimensions.get('window');
  const modalImageWidth = screen.width * 0.9;
  const modalImageHeight = modalImageWidth / aspectRatio;
  const finalHeight = modalImageHeight > screen.height * 0.8 ? screen.height * 0.8 : modalImageHeight;
  const finalWidth = finalHeight * aspectRatio;

  return (
    <>
      <Pressable key={item.id} onPress={valuesVisible ? () => setModalVisible(true) : undefined} onLongPress={onToggleVisibility}>
        <Container style={{marginTop: index === 0 ? 16 : 10, marginLeft: (item.depth ?? 0) * 16}}>
          <HeaderContainer style={{marginBottom: 4}}>
            <HeaderLabel>{item.label}</HeaderLabel>
          </HeaderContainer>
          <ContentContainer
            style={{
              aspectRatio,
              height: 150,
            }}>
            <View style={{borderRadius: 4}}>
              <FastImage
                source={{uri: item.value}}
                style={{
                  aspectRatio,
                  height: 130,
                  borderRadius: 4,
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
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)'}}>
          <Pressable
            onPress={() => setModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel={translate('action_close_label')}
            style={{
              position: 'absolute',
              top: insets.top + 12,
              right: 16,
              zIndex: 1,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: fontColors.light, fontSize: 18, fontWeight: '600', lineHeight: 20}}>✕</Text>
          </Pressable>
          <Pressable style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} onPress={() => setModalVisible(false)}>
            <FastImage
              source={{uri: item.value}}
              style={{width: finalWidth, height: finalHeight, borderRadius: 8}}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

export default SSIImageField;
