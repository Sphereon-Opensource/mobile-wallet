import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useContext} from 'react';
import {GestureResponderEvent, View} from 'react-native';
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

interface Props extends NativeStackHeaderProps {
  headerSubTitle?: string;
  showBorder?: boolean;
  showBackButton?: boolean;
  moreActions?: Array<IHeaderMenuButton>;
  showProfileIcon?: boolean;
}

// TODO fix that there is a slight flash of elements moving when navigating
const SSIHeaderBar: FC<Props> = (props: Props): JSX.Element => {
  const {showBorder = false, showBackButton = true, showProfileIcon = true, moreActions = []} = props;
  const dispatch = useDispatch();
  const {showProfileMenu, setShowProfileMenu, showMoreMenu, setShowMoreMenu} = useContext(OnTouchContext);

  const onBack = async (): Promise<void> => {
    props.navigation.goBack();
  };

  const onProfile = async (): Promise<void> => {
    setShowMoreMenu(false);
    setShowProfileMenu(!showProfileMenu);
  };

  const onProfileLong = async (): Promise<void> => {
    props.navigation.navigate('Veramo', {});
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

    props.navigation.navigate(MainRoutesEnum.POPUP_MODAL, {
      title: translate('profile_delete_wallet_action_title'),
      details: translate('profile_delete_wallet_action_subtitle', {userName: `${activeUser.firstName} ${activeUser.lastName}`}),
      primaryButton: {
        caption: translate('action_confirm_label'),
        onPress: async () => dispatch<any>(deleteUser(activeUser.id)),
      },
      secondaryButton: {
        caption: translate('action_cancel_label'),
        onPress: async () => props.navigation.goBack(),
      },
    });
  };

  const onTouchStart = (event: GestureResponderEvent): void => {
    event.stopPropagation();
  };

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top}} showBorder={showBorder}>
      <Row>
        <LeftColumn>
          {showBackButton && (
            <BackIconContainer>
              <BackIcon icon={ButtonIconsEnum.BACK} onPress={onBack} />
            </BackIconContainer>
          )}
          <HeaderCaption style={{marginTop: showBackButton ? 21.5 : 15, marginBottom: props.headerSubTitle ? 0 : 10}}>
            {props.options.headerTitle as string}
          </HeaderCaption>
          {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
        </LeftColumn>
        <RightColumn>
          {showProfileIcon && (
            // we need this view wrapper to stop the event from propagating to the onTouch provider which will catch the onTouch set show menu to false and then the onPress would set it to true again, as onTouch will be before onPress
            <View onTouchStart={onTouchStart}>
              <ProfileIconContainer onPress={onProfile} onLongPress={onProfileLong}>
                <SSIProfileIcon />
              </ProfileIconContainer>
            </View>
          )}
          {showProfileMenu && (
            <ProfileMenuContainer onTouchStart={onTouchStart}>
              <SSIDropDownList
                buttons={[
                  {
                    caption: translate('profile_logout_action_caption'),
                    onPress: onLogout,
                    icon: HeaderMenuIconsEnum.LOGOUT,
                  },
                  {
                    caption: translate('profile_delete_wallet_action_caption'),
                    onPress: onDeleteWallet,
                    icon: HeaderMenuIconsEnum.DELETE,
                  },
                ]}
              />
            </ProfileMenuContainer>
          )}
          {moreActions.length > 0 && (
            // we need this view wrapper to stop the event from propagating to the onTouch provider which will catch the onTouch set show menu to false and then the onPress would set it to true again, as onTouch will be before onPress
            <View onTouchStart={onTouchStart}>
              <MoreIcon icon={ButtonIconsEnum.MORE} onPress={onMore} />
            </View>
          )}
          {showMoreMenu && (
            <MoreMenuContainer onTouchStart={onTouchStart}>
              <SSIDropDownList buttons={moreActions} />
            </MoreMenuContainer>
          )}
        </RightColumn>
      </Row>
    </Container>
  );
};

export default SSIHeaderBar;
