import {NativeStackHeaderProps, NativeStackScreenProps} from '@react-navigation/native-stack';
import {backgroundColors} from '@sphereon/ui-components.core';
import React, {useContext, useMemo} from 'react';
import {GestureResponderEvent, View} from 'react-native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import SSIDropDownList from '../../../components/dropDownLists/SSIDropDownList';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {translate} from '../../../localization/Localization';
import RootNavigation from '../../../navigation/rootNavigation';
import {SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer} from '../../../styles/components';
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton, ScreenRoutesEnum, StackParamList} from '../../../types';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {AccessibleMenu, Back, Title} from '../components';
import OnTouchContext from '../../../contexts/OnTouchContext';

export type Props = NativeStackHeaderProps;
type NavProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

const CredentialDetailHeader = ({options: {title}, navigation, route}: Props) => {
  const {showMoreMenu, setShowMoreMenu} = useContext(OnTouchContext);
  const {isScreenReaderEnabled, announce} = useAccessibility();
  const menuItems: IHeaderMenuButton[] = [
    {
      caption: translate('show_raw_credential_button_caption'),
      onPress: async (): Promise<void> =>
        RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
          rawCredential: (route as NavProps['route']).params.rawCredential,
        }),
      icon: HeaderMenuIconsEnum.DOWNLOAD,
      accessibilityHint: 'Go to the view raw credential screen',
    },
  ];

  const onTouchStart = (event: GestureResponderEvent): void => {
    event.stopPropagation();
  };

  const Left = useMemo(() => <Back onPress={navigation.goBack} accessibilityHint="Navigate back to the previous screen" />, [navigation]);
  const Center = useMemo(() => <Title>{title ?? translate('activity.unknown.credential')}</Title>, [title]);
  const Right = useMemo(
    () => (
      <View style={{position: 'relative'}} onTouchStart={e => e.stopPropagation()}>
        <SSIIconButton
          accessibilityLabel="More actions button icon"
          accessibilityHint={`${showMoreMenu ? 'close' : 'open'} actions menu`}
          icon={ButtonIconsEnum.MORE}
          style={{height: 42, justifyContent: 'center', paddingHorizontal: 8}}
          onPress={() => {
            setShowMoreMenu(!showMoreMenu);
            announce({message: `Action menu ${!showMoreMenu ? 'opened' : 'closed'}`});
          }}
        />
        {showMoreMenu && !isScreenReaderEnabled && (
          <MoreMenuContainer style={{top: 42, right: 0, width: 'auto'}} onTouchStart={onTouchStart}>
            <SSIDropDownList buttons={menuItems} />
          </MoreMenuContainer>
        )}
      </View>
    ),
    [showMoreMenu, menuItems, isScreenReaderEnabled],
  );
  return (
    <View style={{backgroundColor: backgroundColors.primaryDark}}>
      <HeaderSecondaryBar left={Left} center={Center} right={Right} />
      {showMoreMenu && isScreenReaderEnabled && <AccessibleMenu items={menuItems} />}
    </View>
  );
};

export default CredentialDetailHeader;
