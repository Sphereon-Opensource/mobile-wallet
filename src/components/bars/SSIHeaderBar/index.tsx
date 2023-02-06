import { NativeStackHeaderProps } from '@react-navigation/native-stack/lib/typescript/src/types'
import React, { FC } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ButtonIconsEnum } from '../../../@types'
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
import SSIEntityIcon from '../../assets/icons/SSIEntityIcon'

interface Props extends NativeStackHeaderProps {
  headerSubTitle?: string
  showBorder?: boolean
  showBackButton?: boolean
  moreButtonAction?: () => Promise<void>
  showEntityIcon?: boolean
}

// TODO fix that there is a slight flash of elements moving when navigating
const SSIHeaderBar: FC<Props> = (props: Props): JSX.Element => {
  const { showBorder = false, showBackButton = true, moreButtonAction, showEntityIcon = true } = props

  const onBack = async (): Promise<void> => {
    props.navigation.goBack()
  }

  const onEntity = async (): Promise<void> => {
    props.navigation.navigate('Veramo', {})
  }

  return (
    <Container style={{ marginTop: useSafeAreaInsets().top }} showBorder={showBorder}>
      <Row>
        <LeftColumn>
          {showBackButton && <BackIcon icon={ButtonIconsEnum.BACK} onPress={onBack} />}
          <HeaderCaption style={{ marginTop: showBackButton ? 21.5 : 15, marginBottom: props.headerSubTitle ? 0 : 14 }}>
            {props.options.headerTitle}
          </HeaderCaption>
          {props.headerSubTitle && <HeaderSubCaption>{props.headerSubTitle}</HeaderSubCaption>}
        </LeftColumn>
        <RightColumn>
          {showEntityIcon &&
            <EntityIconContainer onLongPress={onEntity}>
              <SSIEntityIcon />
            </EntityIconContainer>
          }
          {moreButtonAction && <MoreIcon icon={ButtonIconsEnum.MORE} onPress={moreButtonAction} />}
        </RightColumn>
      </Row>
    </Container>
  )
}

export default SSIHeaderBar
