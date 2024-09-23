import {NativeStackHeaderProps, NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {FC, useContext} from 'react';
import {ColorValue, GestureResponderEvent, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import OnTouchContext from '../../../contexts/OnTouchContext';
import {translate} from '../../../localization/Localization';
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
import {ButtonIconsEnum, HeaderMenuIconsEnum, IHeaderMenuButton, IUser, MainRoutesEnum, StackParamList} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import {useDeleteWallet} from '../../../hooks/use-delete-wallet';
import {useLogout} from '../../../hooks/use-logout';

export interface HeaderBarProps extends NativeStackHeaderProps {
  headerSubTitle?: string;
  showBorder?: boolean;
  showBackButton?: boolean;
  moreActions?: Array<IHeaderMenuButton>;
  showProfileIcon?: boolean;
  onBack?: () => void | Promise<void>;
  backgroundColor?: ColorValue;
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

  const onNavigateProfile = () => {
    navigation.navigate(MainRoutesEnum.SETTINGS);
  };

  const onMore = async (): Promise<void> => {
    setShowProfileMenu(false);
    setShowMoreMenu(!showMoreMenu);
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

  return (
    <Container style={{paddingTop: useSafeAreaInsets().top, ...(backgroundColor && {backgroundColor})}} showBorder={showBorder}>
      <Row>
        <LeftColumn>
          {showBackButton && (
            <BackIconContainer>
              <BackIcon icon={ButtonIconsEnum.BACK} onPress={onBack} />
            </BackIconContainer>
          )}
          <HeaderCaption style={{marginTop: showBackButton ? 21.5 : 15, marginBottom: headerSubTitle ? 0 : 10}}>
            {options.headerTitle as string}
          </HeaderCaption>
          {headerSubTitle && <HeaderSubCaption>{headerSubTitle}</HeaderSubCaption>}
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
                    // caption: translate('profile_logout_action_caption'),
                    caption: 'Settings',
                    onPress: onNavigateProfile,
                    icon: HeaderMenuIconsEnum.SETTINGS,
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
