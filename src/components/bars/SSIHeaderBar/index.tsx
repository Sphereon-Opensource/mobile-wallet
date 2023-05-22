import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React, {FC, useContext} from 'react';
import {GestureResponderEvent, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';

import OnTouchContext from '../../../contexts/OnTouchContext';
import {translate} from '../../../localization/Localization';
import {logout} from '../../../store/actions/user.actions';
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
import {
  ButtonIconsEnum,
  HeaderMenuIconsEnum,
  IHeaderMenuButton,
  NavigationBarRoutesEnum,
  ScreenRoutesEnum
} from '../../../types';
import SSIProfileIcon from '../../assets/icons/SSIProfileIcon';
import SSIDropDownList from '../../dropDownLists/SSIDropDownList';
import SSIIconButton from "../../buttons/SSIIconButton";
import RootNavigation from "../../../navigation/rootNavigation";
import {ConnectionTypeEnum, CorrelationIdentifierEnum, IdentityRoleEnum} from "@sphereon/ssi-sdk-data-store";
import {Rules} from "@sphereon/pex-models";

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

  const openSelectContact = async (): Promise<void> => {
    RootNavigation.navigate(NavigationBarRoutesEnum.QR, {
      screen: ScreenRoutesEnum.CREDENTIALS_REQUIRED,
      params: {
        verifier: 'somethig.com',
        presentationDefinition: {
          id: "9449e2db-791f-407c-b086-c21cc677d2e0",
          purpose: "You need to prove your Wallet Identity data",
          submission_requirements: [{
            name: "Wallet Identity",
            rule: Rules.Pick,
            min: 2,
            max: 3,
            from: "A"
          }],
          input_descriptors: [/*{
        id: "walletId",
        purpose: "Checking your Wallet information",
        name: "Wallet Identity",
        group: ["A"],
        schema: [{uri: "https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld"}]
            },*/
            {
              id: "WorkplaceCredential",
              name: "ProfessionalCredential",
              purpose: "We need to verify your employment for the demo",
              group: ["A"],
              schema: [
                {
                  uri: "WorkplaceCredential" // ENTRA
                },
                {uri: "https://sphereon-opensource.github.io/ssi-mobile-wallet/context/sphereon-wallet-identity-v1.jsonld"} // Sphereon

              ],
              constraints: {
                fields: [
                  {
                    path: [
                      "$.issuer",
                      "$.vc.issuer",
                      "$.iss"
                    ],
                    filter: {
                      "type": "string",
                      "pattern": "did.*"
                    }
                  }
                ]
              }
            },
            {
              id: "OpenBadgeCredential",
              name: "AchievementCredential",
              purpose: "We need to verify your achievement for the demo",
              group: ["A"],
              schema: [
                {
                  uri: "AchievementCredential" // ENTRA
                },
                {uri: "https://purl.imsglobal.org/spec/ob/v3p0/context.json"}

              ],
              constraints: {
                fields: [
                  {
                    path: [
                      "$.issuer",
                      "$.vc.issuer",
                      "$.iss",
                      "$.issuer.id",
                    ],
                    filter: {
                      "type": "string",
                      "pattern": "did.*"
                    }
                  }
                ]
              }
            }
          ]
        },
      }
    });

  };

  const openAddContact = async (): Promise<void> => {
    RootNavigation.navigate(NavigationBarRoutesEnum.QR, {
      screen: ScreenRoutesEnum.CONTACT_ADD,
      params: {
        name: 'host.name',
        uri: 'http://host.name',
        identities: [
          {
            alias: 'host.name',
            roles: [IdentityRoleEnum.VERIFIER],
            identifier: {
              type: CorrelationIdentifierEnum.URL,
              correlationId: 'host.name',
            },
            connection: {
              type: ConnectionTypeEnum.SIOPv2,
              config: {}
            },
          },
        ],
        onCreate: () => {console.log("onCreate called.")},
      }
    })
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

        <SSIIconButton icon={ButtonIconsEnum.BACK} onPress={openAddContact} />
        <SSIIconButton icon={ButtonIconsEnum.BACK} onPress={openSelectContact} />
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
