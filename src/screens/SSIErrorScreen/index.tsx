import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIPopup from '../../components/messageBoxes/popups/SSIPopup'
import {
  SSIErrorScreenContentContainerStyled as ContentContainer,
  SSIPopupModalDetailsModalContainerStyled as ExtraDetailsContainer
} from '../../styles/components'
import { SSIBasicContainerStyled as Container } from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.ERROR>

const SSIErrorScreenScreen: FC<Props> = (props: Props): JSX.Element => {
  const { onClose, image, title, titleBadge, details, extraDetails, detailsPopup, primaryButton, secondaryButton } =
    props.route.params

  const [showExtraDetails, setShowExtraDetails] = React.useState(false)

  return (
    <Container>
      <ContentContainer>
        {showExtraDetails && detailsPopup && (
          <ExtraDetailsContainer>
            <SSIPopup
              onClose={async () => setShowExtraDetails(false)}
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
                  onPress: async () => setShowExtraDetails(true)
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
