import React, {FC} from 'react';
import {FlatList, ListRenderItemInfo, ViewStyle} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useBackHandler} from '@react-native-community/hooks';
import {OVERVIEW_INITIAL_NUMBER_TO_RENDER} from '../../@config/constants';
import SSICredentialSelectTypeViewItem from '../../components/views/SSICredentialSelectTypeViewItem';
import {translate} from '../../localization/Localization';
import {
  SSICredentialSelectTypeScreenButtonContainerStyled as ButtonContainer,
  SSIBasicContainerStyled as Container,
  SSICredentialSelectTypeScreenViewItemContainerStyled as ItemContainer,
  SSIStatusBarDarkModeStyled as StatusBar,
} from '../../styles/components';
import {ICredentialTypeSelection, ScreenRoutesEnum, StackParamList} from '../../types';
import {backgroundColors, borderColors} from '@sphereon/ui-components.core';
import {PrimaryButton} from '@sphereon/ui-components.ssi-react-native';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_SELECT_TYPE>;

const SSICredentialSelectTypeScreen: FC<Props> = (props: Props): JSX.Element => {
  const {navigation} = props;
  const {isSelectDisabled, onBack} = props.route.params;
  const [credentialTypes, setCredentialTypes] = React.useState(props.route.params.credentialTypes);

  useBackHandler((): boolean => {
    if (onBack) {
      void onBack();
      // make sure event stops here
      return true;
    }

    // FIXME for some reason returning false does not execute default behaviour
    navigation.goBack();
    return true;
  });

  const getSelectedCredentialTypes = (selection: Array<ICredentialTypeSelection>): Array<string> => {
    return selection
      .filter((credentialTypeSelection: ICredentialTypeSelection) => credentialTypeSelection.isSelected)
      .map((credentialType: ICredentialTypeSelection) => credentialType.credentialType);
  };

  const onSelectType = async (itemInfo: ListRenderItemInfo<ICredentialTypeSelection>): Promise<void> => {
    const {onSelectType} = props.route.params;
    const selection: Array<ICredentialTypeSelection> = credentialTypes.map((credentialType: ICredentialTypeSelection) => {
      credentialType.isSelected =
        credentialType.id === itemInfo.item.id ? (credentialType.isSelected = !itemInfo.item.isSelected) : (credentialType.isSelected = false);
      return credentialType;
    });
    // Creating a copy of the array as React-Native does not see a difference between the new and old array if a value is changed on one of the objects, and therefor will not trigger a rerender
    setCredentialTypes([...selection]);
    if (onSelectType) {
      await onSelectType(getSelectedCredentialTypes(selection));
    }
  };

  const onSelect = async (): Promise<void> => {
    const {onSelect} = props.route.params;
    const selection: Array<string> = getSelectedCredentialTypes(credentialTypes);
    await onSelect(selection);
  };

  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialTypeSelection>): JSX.Element => {
    const backgroundStyle: ViewStyle = {
      backgroundColor: itemInfo.index % 2 === 0 ? backgroundColors.secondaryDark : backgroundColors.primaryDark,
    };
    const style: ViewStyle = {
      ...backgroundStyle,
      ...(itemInfo.index === credentialTypes.length - 1 && itemInfo.index % 2 !== 0 && {borderBottomWidth: 1, borderBottomColor: borderColors.dark}),
    };

    return (
      <ItemContainer style={style} onPress={(): Promise<void> => onSelectType(itemInfo)}>
        <SSICredentialSelectTypeViewItem
          onPress={(): Promise<void> => onSelectType(itemInfo)}
          title={itemInfo.item.credentialAlias}
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
        <PrimaryButton
          style={{height: 42, width: '100%'}}
          caption={translate('action_select_label')}
          onPress={onSelect}
          disabled={isSelectDisabled || credentialTypes.some((credentialType: ICredentialTypeSelection) => credentialType.isSelected)}
        />
      </ButtonContainer>
    </Container>
  );
};

export default SSICredentialSelectTypeScreen;
