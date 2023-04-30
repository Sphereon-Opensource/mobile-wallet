import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useContext} from 'react';
import {GestureResponderEvent, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  SSIHeaderBarContainerStyled as Container,
  SSITextH1LightStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIHeaderBarProfileIconContainerStyled as ProfileIconContainer,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row,
  SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer,
  SSIHeaderBarProfileMenuContainerStyled as ProfileMenuContainer,
} from '../../../styles/components';
import {ButtonIconsEnum, IHeaderMenuButton, HeaderMenuIconsEnum} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import {useDispatch} from 'react-redux';
import {logout} from '../../../store/actions/user.actions';
import {translate} from '../../../localization/Localization';
import OnTouchContext from '../../../contexts/OnTouchContext';

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
            {props.options.headerTitle}
          </HeaderCaption>
          {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
        </LeftColumn>
        <RightColumn>
          {showProfileIcon && (
            // we need this view wrapper to stop the event from propagating to the ontouch provider which will catch the ontouch set show menu to false and then the onpress would set it to true again, as ontouch will be before onpress
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
                ]}
              />
            </ProfileMenuContainer>
          )}
          {moreActions.length > 0 && (
            // we need this view wrapper to stop the event from propagating to the ontouch provider which will catch the ontouch set show menu to false and then the onpress would set it to true again, as ontouch will be before onpress
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
