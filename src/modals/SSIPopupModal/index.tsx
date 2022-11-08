import React, { PureComponent } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types'

import { RootRoutesEnum, StackParamList } from '../../@types'
import SSIPopup from '../../components/messageBoxes/popups/SSIPopup'
import { SSIPopupModalDetailsModalContainerStyled } from '../../styles/components'
import {
  SSIBasicModalContainerStyled as Container,
  SSIPopupModalContentContainerStyled as ModalContentContainer
} from '../../styles/styledComponents'

type Props = NativeStackScreenProps<StackParamList, RootRoutesEnum.POPUP_MODAL>

interface IScreenState {
  showExtraDetails: boolean
}

export class SSIPopupModal extends PureComponent<Props, IScreenState> {
  constructor(props: Props) {
    super(props)

    this.state = {
      showExtraDetails: false
    }
  }

  render() {
    const {
      closeButtonOnPress,
      image,
      title,
      titleBadge,
      details,
      extraDetails,
      detailsPopup,
      primaryButton,
      secondaryButton
    } = this.props.route.params

    return (
      <Container>
        <ModalContentContainer>
          {this.state.showExtraDetails && (
            <SSIPopupModalDetailsModalContainerStyled>
              <SSIPopup
                closeButtonOnPress={async () =>
                  this.setState({
                    showExtraDetails: false
                  })
                }
                title={detailsPopup!.title}
                details={detailsPopup!.details}
                extraDetails={detailsPopup!.extraDetails}
              />
            </SSIPopupModalDetailsModalContainerStyled>
          )}

          <SSIPopup
            closeButtonOnPress={closeButtonOnPress}
            image={image}
            title={title}
            titleBadge={titleBadge}
            details={details}
            extraDetails={extraDetails}
            detailsButton={{
              caption: detailsPopup!.buttonCaption,
              onPress: async () =>
                this.setState({
                  showExtraDetails: true
                })
            }}
            primaryButton={primaryButton}
            secondaryButton={secondaryButton}
          />
        </ModalContentContainer>
      </Container>
    )
  }
}
