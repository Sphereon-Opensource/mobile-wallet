import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useEffect} from 'react';
import {DeviceEventEmitter, TouchableWithoutFeedback} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarBackIconContainerStyled as BackIconContainer,
  SSIHeaderBarContainerStyled as Container,
  SSIHeaderBarHeaderCaptionStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIHeaderBarProfileIconContainerStyled as ProfileIconContainer,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row,
  SSIHeaderBarMoreMenuContainerStyled as MoreMenuContainer,
  SSIHeaderBarProfileMenuContainerStyled as ProfileMenuContainer,
} from '../../../styles/components';
import {ButtonIconsEnum, HeaderEventEnum, IMoreMenuButton} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import {useDispatch} from 'react-redux';
import {logout} from '../../../store/actions/user.actions';
import {translate} from '../../../localization/Localization';

interface Props extends NativeStackHeaderProps {
  headerSubTitle?: string;
  showBorder?: boolean;
  showBackButton?: boolean;
  moreActions?: Array<IMoreMenuButton>;
  showProfileIcon?: boolean;
}

// TODO fix that there is a slight flash of elements moving when navigating
const SSIHeaderBar: FC<Props> = (props: Props): JSX.Element => {
  const {showBorder = false, showBackButton = true, showProfileIcon = true, moreActions = []} = props;
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(HeaderEventEnum.ON_MORE_MENU_CLOSE, () => {
      setShowMoreMenu(false);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onBack = async (): Promise<void> => {
    props.navigation.goBack();
  };

  const onProfile = async (): Promise<void> => {
    setShowProfileMenu(!showProfileMenu);
  };

  const onProfileLong = async (): Promise<void> => {
    props.navigation.navigate('Veramo', {});
  };

  const onMore = async (): Promise<void> => {
    setShowMoreMenu(!showMoreMenu);
  };

  const onPress = async (): Promise<void> => {
    setShowMoreMenu(false);
    setShowProfileMenu(false);
  };

  return (
    <TouchableWithoutFeedback onPress={onPress} accessible={false}>
      <Container style={{paddingTop: useSafeAreaInsets().top}} showBorder={showBorder}>
        <Row>
          <LeftColumn>
            {showBackButton && (
              <BackIconContainer>
                <BackIcon icon={ButtonIconsEnum.BACK} onPress={onBack} />
              </BackIconContainer>
            )}
            <HeaderCaption style={{marginTop: showBackButton ? 21.5 : 15, marginBottom: props.headerSubTitle ? 0 : 14}}>
              {props.options.headerTitle}
            </HeaderCaption>
            {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
          </LeftColumn>
          <RightColumn>
            {showProfileIcon && (
              <ProfileIconContainer onPress={onProfile} onLongPress={onProfileLong}>
                <SSIProfileIcon />
              </ProfileIconContainer>
            )}
            {showProfileMenu && (
              <ProfileMenuContainer>
                <SSIDropDownList
                  buttons={[
                    {
                      caption: translate('profile_logout_label'),
                      onPress: () => dispatch<any>(logout()),
                    },
                  ]}
                />
              </ProfileMenuContainer>
            )}
            {moreActions.length > 0 && <MoreIcon icon={ButtonIconsEnum.MORE} onPress={onMore} />}
            {showMoreMenu && (
              <MoreMenuContainer>
                <SSIDropDownList buttons={moreActions} />
              </MoreMenuContainer>
            )}
          </RightColumn>
        </Row>
      </Container>
    </TouchableWithoutFeedback>
  );
};

export default SSIHeaderBar;
