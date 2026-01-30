import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useCallback, useContext, useEffect, useMemo, useRef} from 'react';
import {ColorValue, GestureResponderEvent, Pressable, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import OnTouchContext from '../../../contexts/OnTouchContext';
import {useDeleteWallet} from '../../../hooks/use-delete-wallet';
import {useLogout} from '../../../hooks/use-logout';
import {useAccessibility} from '../../../hooks/useAccessibility';
import {translate} from '../../../localization/Localization';
import {
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  SSIHeaderBarContainerStyled as Container,
  SSITextH1LightStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer,
  SSIHeaderBarProfileMenuContainerStyled as ProfileMenuContainer,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row,
  SSIHeaderBarProfileIconContainerStyled as ProfileIconContainer,
} from '../../../styles/components';
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton, MainRoutesEnum} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import {AccessibleMenu, Back} from '../components';

export interface HeaderBarProps extends NativeStackHeaderProps {
  headerSubTitle?: string;
  showBorder?: boolean;
  showBackButton?: boolean;
  moreActions?: Array<IHeaderMenuButton>;
  showProfileIcon?: boolean;
  onBack?: () => void | Promise<void>;
  backgroundColor?: ColorValue;
  disableFocusOnTitle?: boolean;
}

// TODO fix that there is a slight flash of elements moving when navigating
// NK: Probably has todo with us passing in a new headerbar element via props on every screen, causing a rerender of the entire dom
const SSIHeaderBar: FC<HeaderBarProps> = (props: HeaderBarProps): JSX.Element => {
  const {
    showBorder = false,
    showBackButton = true,
    showProfileIcon = true,
    headerSubTitle,
    options,
    moreActions = [],
    navigation,
    backgroundColor,
    disableFocusOnTitle = false,
  } = props;
  const dispatch = useDispatch();
  const {showProfileMenu, setShowProfileMenu, showMoreMenu, setShowMoreMenu} = useContext(OnTouchContext);
  const {setFocus, isScreenReaderEnabled, announce} = useAccessibility();
  const onBack = async (): Promise<void> => {
    typeof props.onBack === 'function' ? await props.onBack() : props.navigation.goBack();
  };

  const onProfile = async (): Promise<void> => {
    setShowMoreMenu(false);
    setShowProfileMenu(!showProfileMenu);
    announce({message: `Menu ${!showProfileMenu ? 'opened' : 'closed'}`});
  };

  const onNavigateProfile = () => {
    navigation.navigate(MainRoutesEnum.SETTINGS);
  };

  const onMore = async (): Promise<void> => {
    setShowProfileMenu(false);
    setShowMoreMenu(!showMoreMenu);
    announce({message: `Action menu ${!showMoreMenu ? 'opened' : 'closed'}`});
  };

  const logout = useLogout();
  const onLogout = async (): Promise<void> => {
    setShowProfileMenu(false);
    logout();
  };

  const promptDelete = useDeleteWallet();
  const onDeleteWallet = async (): Promise<void> => {
    setShowProfileMenu(false);
    promptDelete();
  };

  const onTouchStart = (event: GestureResponderEvent): void => {
    event.stopPropagation();
  };

  const menuItems = useMemo<IHeaderMenuButton[]>(
    () => [
      {
        caption: translate('settings_dropdown_item_text'),
        onPress: onNavigateProfile,
        icon: HeaderMenuIconsEnum.SETTINGS,
        accessibilityHint: translate('settings_dropdown_item_accessibility_hint'),
      },
      {
        caption: translate('lock_dropdown_item_text'),
        onPress: onLogout,
        icon: HeaderMenuIconsEnum.LOGOUT,
        accessibilityHint: translate('lock_dropdown_item_accessibility_hint'),
      },
    ],
    [onNavigateProfile, onLogout],
  );

  const titleRef = useRef(null);
  const focusOnTitle = useCallback(() => setFocus(titleRef), [titleRef.current]);
  useEffect(() => {
    if (!disableFocusOnTitle) focusOnTitle();
  }, [disableFocusOnTitle]);
  return (
    <Container style={{paddingTop: useSafeAreaInsets().top, ...(backgroundColor && {backgroundColor})}} showBorder={showBorder}>
      <Row style={{alignItems: 'center'}}>
        <LeftColumn>
          {showBackButton && (
            <BackIconContainer>
              <Back onPress={onBack} />
            </BackIconContainer>
          )}
          <HeaderCaption
            accessible
            accessibilityRole="header"
            style={{marginTop: showBackButton ? 21.5 : 15, marginBottom: headerSubTitle ? 0 : 10}}
            ref={titleRef}>
            {options.headerTitle as string}
          </HeaderCaption>
          {headerSubTitle && <HeaderSubCaption>{headerSubTitle}</HeaderSubCaption>}
        </LeftColumn>
        <RightColumn>
          {showProfileIcon && (
            // we need this view wrapper to stop the event from propagating to the onTouch provider which will catch the onTouch set show menu to false and then the onPress would set it to true again, as onTouch will be before onPress
            <View onTouchStart={onTouchStart}>
              {/*Disabled for accessibility, not sure if the old implementation had issues*/}
              {/*<ProfileIconContainer onPress={onProfile} accessibilityRole="togglebutton" accessibilityState={{checked: showProfileMenu}}>*/}
              {/*  <SSIProfileIcon />*/}
              {/*</ProfileIconContainer>*/}
              <Pressable onPress={onProfile} accessibilityRole="togglebutton" accessibilityState={{checked: showProfileMenu}}>
                <SSIProfileIcon />
              </Pressable>
            </View>
          )}
          {showProfileMenu && !isScreenReaderEnabled && (
            <ProfileMenuContainer onTouchStart={onTouchStart}>
              <SSIDropDownList buttons={menuItems} />
            </ProfileMenuContainer>
          )}
          {moreActions.length > 0 && (
            // we need this view wrapper to stop the event from propagating to the onTouch provider which will catch the onTouch set show menu to false and then the onPress would set it to true again, as onTouch will be before onPress
            <View onTouchStart={onTouchStart}>
              <MoreIcon
                icon={ButtonIconsEnum.MORE}
                onPress={onMore}
                accessibilityRole="togglebutton"
                accessibilityState={{checked: showMoreMenu}}
                accessibilityLabel="Actions menu button icon"
                accessibilityHint={`${showMoreMenu ? 'close' : 'open'} actions menu`}
              />
            </View>
          )}
          {showMoreMenu && !isScreenReaderEnabled && (
            <MoreMenuContainer onTouchStart={onTouchStart}>
              <SSIDropDownList buttons={moreActions} />
            </MoreMenuContainer>
          )}
        </RightColumn>
      </Row>
      {showProfileMenu && isScreenReaderEnabled && <AccessibleMenu items={menuItems} />}
      {showMoreMenu && isScreenReaderEnabled && <AccessibleMenu items={moreActions} />}
    </Container>
  );
};

export default SSIHeaderBar;
