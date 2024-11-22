import {NativeStackHeaderProps, NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import SSIIconButton from '../../../components/buttons/SSIIconButton';
import SSIDropDownList from '../../../components/dropDownLists/SSIDropDownList';
import {translate} from '../../../localization/Localization';
import RootNavigation from '../../../navigation/rootNavigation';
import {SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer} from '../../../styles/components';
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton, ScreenRoutesEnum, StackParamList} from '../../../types';
import {HeaderSecondaryBar} from '../HeaderSecondaryBar';
import {Back, Title} from '../components';

export type Props = NativeStackHeaderProps;
type NavProps = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CREDENTIAL_DETAILS>;

const CredentialDetailMenu = ({items}: {items: IHeaderMenuButton[]}) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <>
      <View style={{position: 'relative'}} onTouchStart={e => e.stopPropagation()}>
        <SSIIconButton
          icon={ButtonIconsEnum.MORE}
          style={{height: 42, justifyContent: 'center', paddingHorizontal: 8}}
          onPress={() => setShowMenu(sm => !sm)}
        />
        {showMenu && (
          <MoreMenuContainer style={{top: 42, right: 0, width: 'auto'}} onTouchStart={e => e.stopPropagation()}>
            <SSIDropDownList buttons={items} />
          </MoreMenuContainer>
        )}
      </View>
    </>
  );
};

const CredentialDetailHeader = ({options: {title}, navigation, route}: Props) => {
  const Left = useMemo(() => <Back onPress={() => navigation.goBack()} />, [navigation]);

  const Center = useMemo(() => <Title>{title ?? translate('activity.unknown.credential')}</Title>, [title]);

  const Right = useMemo(
    () => (
      <CredentialDetailMenu
        items={[
          {
            caption: translate('show_raw_credential_button_caption'),
            onPress: async (): Promise<void> =>
              RootNavigation.navigate(ScreenRoutesEnum.CREDENTIAL_RAW_JSON, {
                rawCredential: (route as NavProps['route']).params.rawCredential,
              }),
            icon: HeaderMenuIconsEnum.DOWNLOAD,
          },
        ]}
      />
    ),
    [],
  );
  return <HeaderSecondaryBar left={Left} center={Center} right={Right} />;
};

export default CredentialDetailHeader;
