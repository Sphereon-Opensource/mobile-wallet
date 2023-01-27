import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIPopup from '../../components/messageBoxes/popups/SSIPopup'
import {
  SSIBasicContainerStyled as Container,
  SSIErrorScreenContentContainerStyled as ContentContainer,
  SSIPopupModalDetailsModalContainerStyled as ExtraDetailsContainer
} from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ERROR>

const SSIErrorScreenScreen: FC<Props> = (props: Props): JSX.Element => {
  const { onClose, image, title, titleBadge, details, extraDetails, detailsPopup, primaryButton, secondaryButton } =
    props.route.params
  const [showExtraDetails, setShowExtraDetails] = React.useState(false)

  const onShowDetails = async (): Promise<void> => {
    setShowExtraDetails(true)
  }

  const onCloseDetails = async (): Promise<void> => {
    setShowExtraDetails(true)
  }

  return (
    <Container>
      <ContentContainer>
        {showExtraDetails && detailsPopup && (
          <ExtraDetailsContainer>
            <SSIPopup
              onClose={onCloseDetails}
              title={detailsPopup.title}
              details={detailsPopup.details}
              extraDetails={detailsPopup.extraDetails}
              darkMode
            />
          </ExtraDetailsContainer>
        )}
        <SSIPopup
          onClose={onClose}
          image={image}
          title={title}
          titleBadge={titleBadge}
          details={details}
          extraDetails={extraDetails}
          detailsButton={
            detailsPopup
              ? {
                  caption: detailsPopup.buttonCaption,
                  onPress: onShowDetails
                }
              : undefined
          }
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          darkMode
        />
      </ContentContainer>
    </Container>
  )
}

export default SSIErrorScreenScreen
