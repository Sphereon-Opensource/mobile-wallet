import { NativeStackHeaderProps } from '@react-navigation/native-stack'
import React, { FC, useEffect } from 'react'
import { NativeEventEmitter, NativeModules, TouchableWithoutFeedback, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarContainerStyled as Container,
  SSIHeaderBarEntityIconContainerStyled as EntityIconContainer,
  SSIHeaderBarHeaderCaptionStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row
} from '../../../styles/components'
import { ButtonIconsEnum, HeaderEventEnum, IMoreMenuButton } from '../../../types'
import SSIEntityIcon from '../../assets/icons/SSIEntityIcon'
import SSIDropDownList from '../../dropDownLists/SSIDropDownList'

interface Props extends NativeStackHeaderProps {
  headerSubTitle?: string
  showBorder?: boolean
  showBackButton?: boolean
  moreActions?: Array<IMoreMenuButton>
  showEntityIcon?: boolean
}

const { MyModule } = NativeModules
export const headerEmitter = new NativeEventEmitter(MyModule)

// TODO fix that there is a slight flash of elements moving when navigating
const SSIHeaderBar: FC<Props> = (props: Props): JSX.Element => {
  const { showBorder = false, showBackButton = true, showEntityIcon = true, moreActions = [] } = props
  const [showMoreMenu, setShowMoreMenu] = React.useState(false)

  useEffect(() => {
    const subscription = headerEmitter.addListener(HeaderEventEnum.ON_MORE_MENU_CLOSE, () => {
      setShowMoreMenu(false)
    })

    return () => {
      subscription.remove()
    }
  }, [])

  const onBack = async (): Promise<void> => {
    props.navigation.goBack()
  }

  const onEntity = async (): Promise<void> => {
    props.navigation.navigate('Veramo', {})
  }

  const onMore = async (): Promise<void> => {
    setShowMoreMenu(!showMoreMenu)
  }

  const onPress = async (): Promise<void> => {
    setShowMoreMenu(false)
  }

  return (
    <TouchableWithoutFeedback onPress={onPress} accessible={false}>
      <Container style={{ marginTop: useSafeAreaInsets().top }} showBorder={showBorder}>
        <Row>
          <LeftColumn>
            {showBackButton && <BackIcon icon={ButtonIconsEnum.BACK} onPress={onBack} />}
            <HeaderCaption
              style={{ marginTop: showBackButton ? 21.5 : 15, marginBottom: props.headerSubTitle ? 0 : 14 }}
            >
              {props.options.headerTitle}
            </HeaderCaption>
            {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
          </LeftColumn>
          <RightColumn>
            {showEntityIcon && (
              <EntityIconContainer onLongPress={onEntity}>
                <SSIEntityIcon />
              </EntityIconContainer>
            )}
            {moreActions.length > 0 && <MoreIcon icon={ButtonIconsEnum.MORE} onPress={onMore} />}
            {showMoreMenu && (
              <View style={{ position: 'absolute', width: 250, right: 10, top: 92 }}>
                <SSIDropDownList buttons={moreActions} />
              </View>
            )}
          </RightColumn>
        </Row>
      </Container>
    </TouchableWithoutFeedback>
  )
}

export default SSIHeaderBar
