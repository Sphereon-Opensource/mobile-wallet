import { NativeStackHeaderProps } from '@react-navigation/native-stack/lib/typescript/src/types'
import React, { FC } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ButtonIconsEnum } from '../../../@types'
import {
  SSIHeaderBarBackIconStyled as BackIcon,
  SSIHeaderBarContainerStyled as Container,
  SSIHeaderBarEntityIconStyled as EntityIcon,
  SSIHeaderBarHeaderCaptionStyled as HeaderCaption,
  SSIHeaderBarHeaderSubCaptionStyled as HeaderSubCaption,
  SSIFlexDirectionColumnViewStyled as LeftColumn,
  SSIHeaderBarMoreIconStyled as MoreIcon,
  SSIRightColumnRightAlignedContainerStyled as RightColumn,
  SSIFlexDirectionRowViewStyled as Row
} from '../../../styles/components'

interface Props extends NativeStackHeaderProps {
  headerSubTitle?: string
  showBorder?: boolean
  showBackButton?: boolean
  showMoreButton?: boolean
  moreButtonAction?: () => Promise<void>
}

// TODO fix that there is a slight flash of elements moving when navigating
const SSIHeaderBar: FC<Props> = (props: Props): JSX.Element => {
  const { showBorder = false, showBackButton = false, showMoreButton = false, moreButtonAction } = props

  return (
    <Container style={{ marginTop: useSafeAreaInsets().top }} showBorder={showBorder}>
      <Row>
        <LeftColumn>
          {showBackButton && <BackIcon icon={ButtonIconsEnum.BACK} onPress={() => props.navigation.goBack()} />}
          <HeaderCaption style={{ marginTop: showBackButton ? 21.5 : 15, marginBottom: props.headerSubTitle ? 0 : 14 }}>
            {props.options.headerTitle}
          </HeaderCaption>
          {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
        </LeftColumn>
        <RightColumn>
          <EntityIcon onPress={() => props.navigation.navigate('Veramo', {})} />
          {showMoreButton && <MoreIcon icon={ButtonIconsEnum.MORE} onPress={() => moreButtonAction} />}
        </RightColumn>
      </Row>
    </Container>
  )
}

export default SSIHeaderBar
