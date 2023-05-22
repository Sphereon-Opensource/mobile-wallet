import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';
import {FlatList, ListRenderItemInfo} from 'react-native';

import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSIPrimaryButton from '../../components/buttons/SSIPrimaryButton';
import SSICredentialSelectTypeViewItem from '../../components/views/SSICredentialSelectTypeViewItem';
import {translate} from '../../localization/Localization';
import {backgrounds, borders} from '../../styles/colors';
import {
  SSICredentialSelectTypeScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectTypeScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialTypeSelection, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE>;

const SSICredentialSelectTypeScreen: FC<Props> = (props: Props): JSX.Element => {
  const [credentialTypes, setCredentialTypes] = React.useState(props.route.params.credentialTypes);

  const onPress = (itemInfo: ListRenderItemInfo<ICredentialTypeSelection>) => {
    const selection = credentialTypes.map((credentialType: ICredentialTypeSelection) => {
      credentialType.isSelected =
        credentialType.id == itemInfo.item.id ? (credentialType.isSelected = !itemInfo.item.isSelected) : (credentialType.isSelected = false);
      return credentialType;
    });
    // Creating a copy of the array as React-Native does not see a difference between the new and old array if a value is changed on one of the objects, and therefor will not trigger a rerender
    setCredentialTypes([...selection]);
  };

  const onSelect = async (): Promise<void> => {
    const selectedTypesOfCredentials = credentialTypes
      .filter((credentialTypeSelection: ICredentialTypeSelection) => credentialTypeSelection.isSelected)
      .map((credentialType: ICredentialTypeSelection) => credentialType.credentialType);
    await props.route.params.onSelect(selectedTypesOfCredentials);
  };

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialTypeSelection>): JSX.Element => {
    const backgroundStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgrounds.secondaryDark : backgrounds.primaryDark,
    };
    const style = {
      ...backgroundStyle,
      ...(itemInfo.index === credentialTypes.length - 1 && itemInfo.index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borders.dark}),
    };

    return (
      <ItemContainer style={style} onPress={() => onPress(itemInfo)}>
        <SSICredentialSelectTypeViewItem
          onPress={async () => onPress(itemInfo)}
          title={itemInfo.item.credentialType}
          isSelected={itemInfo.item.isSelected}
          style={backgroundStyle}
        />
      </ItemContainer>
    );
  };

  return (
    <Container>
      <StatusBar />
      <FlatList
        data={credentialTypes}
        renderItem={renderItem}
        keyExtractor={(itemInfo: ICredentialTypeSelection) => itemInfo.id}
        initialNumToRender={OVERVIEW_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
      <ButtonContainer>
        <SSIPrimaryButton
          style={{height: 42, width: '100%'}}
          title={translate('action_select_label')}
          onPress={onSelect}
          disabled={!credentialTypes.some((credentialType: ICredentialTypeSelection) => credentialType.isSelected)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialSelectTypeScreen;
