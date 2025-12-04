import {backgroundColors} from '@sphereon/ui-components.core';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import React, {FC, ReactElement} from 'react';
import {ListRenderItemInfo, View, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {SSICredentialDetailsViewContainerStyled as Container, SSIDetailsViewDetailsListStyled as DetailsList} from '../../../styles/components';
import {IButton} from '../../../types';
import SSIImageField from '../../fields/SSIImageField';
import SSITextField from '../../fields/SSITextField';

export interface IContactDetailsViewProps {
  properties: Array<CredentialDetailsRow>;
  primaryButton?: IButton;
  secondaryButton?: IButton;
  style?: ViewStyle;
}

export const ContactDetailsView: FC<IContactDetailsViewProps> = (props: IContactDetailsViewProps): ReactElement => {
  const {style, properties, secondaryButton, primaryButton} = props;
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    console.log('[ContactDetailsView] Safe area insets:', insets);
    console.log('[ContactDetailsView] Calculated bottom padding:', Math.max(36, insets.bottom));
  }, [insets.bottom]);

  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };
  //style
  return (
    <Container style={{...style}} accessibilityRole="list" accessibilityLabel="Contact details">
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
        ListFooterComponentStyle={{flex: 1, justifyContent: 'flex-end', paddingBottom: insets.bottom}} // used to put tthe footer at the bottom of the screen if flatlist does not fill space available
        ListFooterComponent={
          primaryButton || secondaryButton ? (
            <View
              style={{
                paddingTop: 12,
                paddingBottom: 12,
                paddingLeft: 24,
                paddingRight: 24,
                gap: 12,
                backgroundColor: backgroundColors.primaryDark,
                marginTop: 20,
                borderWidth: 3,
                borderColor: 'red',
              }}>
              {primaryButton && <PrimaryButton accessibilityRole="button" caption={primaryButton.caption} onPress={primaryButton.onPress} />}
              {secondaryButton && <SecondaryButton accessibilityRole="button" caption={secondaryButton.caption} onPress={secondaryButton.onPress} />}
            </View>
          ) : null
        }
      />
    </Container>
  );
};
