import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'

import { RootRoutesEnum, StackParamList } from '../../@types'
import SSIPopup from '../../components/messageBoxes/popups/SSIPopup'
import { SSIPopupModalDetailsModalContainerStyled as ExtraDetailsContainer } from '../../styles/components'
import {
  SSIBasicModalContainerStyled as Container,
  SSIPopupModalContentContainerStyled as ModalContentContainer
} from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, RootRoutesEnum.POPUP_MODAL>

const SSIPopupModal: FC<Props> = (props: Props): JSX.Element => {
  const { onClose, image, title, titleBadge, details, extraDetails, detailsPopup, primaryButton, secondaryButton } =
    props.route.params

  const [showExtraDetails, setShowExtraDetails] = React.useState(false)

  return (
    <Container>
      <ModalContentContainer>
        {showExtraDetails && detailsPopup && (
          <ExtraDetailsContainer>
            <SSIPopup
              onClose={async () => setShowExtraDetails(false)}
              title={detailsPopup.title}
              details={detailsPopup.details}
              extraDetails={detailsPopup.extraDetails}
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
        />
      </ModalContentContainer>
    </Container>
  )
}

export default SSIPopupModal
