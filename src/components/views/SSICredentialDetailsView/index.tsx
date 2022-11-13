import React, { FC } from 'react'
import { ListRenderItemInfo } from 'react-native'

import { DETAILS_INITIAL_NUMBER_TO_RENDER } from '../../../@config/constants'
import { ICredentialDetailsRow } from '../../../@types'
import { translate } from '../../../localization/Localization';
import {
  SSICredentialDetailsViewContainerStyled as Container,
  SSICredentialDetailsViewFooterContainerStyled as FooterContainer,
  SSICredentialDetailsViewFooterLabelValueStyled as SignedBy,
  SSICredentialDetailsViewFooterLabelCaptionStyled as SignedByLabel
} from '../../../styles/components'
import { SSIDetailsViewDetailsListStyled as DetailsList } from '../../../styles/styledComponents'
import SSITextField from '../../fields/SSITextField'

export interface IProps {
  credentialProperties: Array<ICredentialDetailsRow>
  issuer: string
}

const SSICredentialDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<ICredentialDetailsRow>) => (
      <SSITextField item={itemInfo.item} index={itemInfo.index} />
  )

  const renderFooter = () => (
      <FooterContainer>
        <SignedByLabel>{translate('credential_details_view_signed_by')}</SignedByLabel>
        <SignedBy>{props.issuer}</SignedBy>
      </FooterContainer>
  )

  return (
    <Container>
      <DetailsList
        // TODO fix DetailsList
        data={props.credentialProperties}
        renderItem={renderItem}
        keyExtractor={(item: ICredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
        ListFooterComponent={renderFooter}
      />
    </Container>
  )
}

export default SSICredentialDetailsView
