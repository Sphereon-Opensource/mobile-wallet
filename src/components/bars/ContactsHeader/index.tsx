import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useContext} from 'react';
import {ColorValue, Dimensions, GestureResponderEvent, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import OnTouchContext from '../../../contexts/OnTouchContext';
import {translate} from '../../../localization/Localization';
import store from '../../../store';
import {deleteUser, logout} from '../../../store/actions/user.actions';
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  SSIHeaderBarContainerStyled as Container,
  SSITextH1LightStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer,
  SSIHeaderBarProfileIconContainerStyled as ProfileIconContainer,
  SSIHeaderBarProfileMenuContainerStyled as ProfileMenuContainer,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row,
} from '../../../styles/components';
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton, IUser, MainRoutesEnum} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import styled from 'styled-components/native';

export interface ContactsHeaderBarProps extends NativeStackHeaderProps {
  headerSubTitle?: string;
  showBorder?: boolean;
  showBackButton?: boolean;
  moreActions?: Array<IHeaderMenuButton>;
  showProfileIcon?: boolean;
  onBack?: () => void | Promise<void>;
  backgroundColor?: ColorValue;
}

const CenterRow = styled(Row)`
  align-items: center;
  padding-top: 13px;
  padding-bottom: 12px;
`;

const Back = styled(BackIcon)`
  margin-top: 0px;
`;

const BackContainer = styled(BackIconContainer)`
  position: absolute;
  left: 10px;
  z-index: 10;
`;

const {width} = Dimensions.get('window');

// TODO fix that there is a slight flash of elements moving when navigating
// NK: Probably has todo with us passing in a new headerbar element via props on every screen, causing a rerender of the entire dom
const ContactsHeader: FC<ContactsHeaderBarProps> = (props: ContactsHeaderBarProps): JSX.Element => {
  const {
    showBorder = false,
    showBackButton = true,
    showProfileIcon = true,
    headerSubTitle,
    options,
    moreActions = [],
    navigation,
    backgroundColor,
  } = props;
  const dispatch = useDispatch();
  const {showProfileMenu, setShowProfileMenu, showMoreMenu, setShowMoreMenu} = useContext(OnTouchContext);

  const onBack = async (): Promise<void> => {
    typeof props.onBack === 'function' ? await props.onBack() : props.navigation.goBack();
  };

  const onProfile = async (): Promise<void> => {
    setShowMoreMenu(false);
    setShowProfileMenu(!showProfileMenu);
  };

  const onProfileLong = async (): Promise<void> => {
    navigation.navigate('Veramo', {});
  };

  const onMore = async (): Promise<void> => {
    setShowProfileMenu(false);
    setShowMoreMenu(!showMoreMenu);
  };

  const onLogout = async (): Promise<void> => {
    setShowProfileMenu(false);
    dispatch<any>(logout());
  };

  const onDeleteWallet = async (): Promise<void> => {
    setShowProfileMenu(false);
    const activeUser: IUser = store.getState().user.activeUser!;

    navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('profile_delete_wallet_action_title'),
      details: translate('profile_delete_wallet_action_subtitle', {userName: `${activeUser.firstName} ${activeUser.lastName}`}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async (): Promise<void> => dispatch<any>(deleteUser(activeUser.id)),
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async (): Promise<void> => navigation.goBack(),
      },
    });
  };

  const onTouchStart = (event: GestureResponderEvent): void => {
    event.stopPropagation();
  };

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top, ...(backgroundColor && {backgroundColor})}} showBorder={showBorder}>
      <CenterRow>
        {showBackButton && (
          <BackContainer>
            <Back icon={ButtonIconsEnum.BACK} onPress={onBack} />
          </BackContainer>
        )}
        {/* {headerSubTitle && <HeaderSubCaption>{headerSubTitle}</HeaderSubCaption>} */}
        <HeaderCaption style={{textAlign: 'center', flex: 1}}>{options.headerTitle as string}</HeaderCaption>
      </CenterRow>
    </Container>
  );
};

export default ContactsHeader;
