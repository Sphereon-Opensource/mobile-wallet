import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {FC, ReactElement} from 'react';
import {ListRenderItemInfo, StyleProp, View, ViewStyle} from 'react-native';
import SSIImageField from '../../fields/SSIImageField';
import SSITextField from '../../fields/SSITextField';
import {SSICredentialDetailsViewContainerStyled as Container, SSIDetailsViewDetailsListStyled as DetailsList} from '../../../styles/components';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {IButton} from '../../../types';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {backgroundColors} from '@sphereon/ui-components.core';

export interface IContactDetailsViewProps {
  properties: Array<CredentialDetailsRow>;
  primaryButton?: IButton;
  secondaryButton?: IButton;
  style?: ViewStyle;
}

export const ContactDetailsView: FC<IContactDetailsViewProps> = (props: IContactDetailsViewProps): ReactElement => {
  const {style, properties, secondaryButton, primaryButton} = props;
  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };
  //style
  return (
    <Container style={{...style}}>
      <DetailsList
        data={properties.filter(p => p.value !== undefined)}
        renderItem={renderItem}
        keyExtractor={(item: CredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        // contentContainerStyle={{
        //   flexGrow: 1,
        //   //justifyContent: data.length * 50 < screenHeight ? 'space-between' : 'flex-start' // Adjust if item height is not 50
        // }}
        // contentContainerStyle={{
        //   height: 1000,
        // }}
        contentContainerStyle={{flexGrow: 1}} // used to put tthe footer at the bottom of the screen if flatlist does not fill space available
        ListFooterComponentStyle={{flex: 1, justifyContent: 'flex-end'}} // used to put tthe footer at the bottom of the screen if flatlist does not fill space available
        ListFooterComponent={
          primaryButton || secondaryButton ? (
            <View
              style={{
                paddingTop: 36,
                paddingBottom: 36,
                paddingLeft: 24,
                paddingRight: 24,
                gap: 12,
                backgroundColor: backgroundColors.primaryDark,
                marginTop: 20,
              }}>
              {primaryButton && <PrimaryButton caption={primaryButton.caption} onPress={primaryButton.onPress} />}
              {secondaryButton && <SecondaryButton caption={secondaryButton.caption} onPress={secondaryButton.onPress} />}
            </View>
          ) : null
        }
      />
    </Container>
  );
};
