import React, { FC } from 'react'

import SSIEditIcon from '../../../components/assets/icons/SSIEditIcon'
import {
  SSITextFieldContainerStyled as Container,
  SSITextFieldContentBadgeContainerStyled as ContentBadgeContainer,
  SSIFlexDirectionRowViewStyled as ContentContainer,
  SSITextFieldContentTextStyled as ContentText,
  SSITextFieldEditBadgeContainerStyled as EditBadgeContainer,
  SSITextFieldHeaderContainerStyled as HeaderContainer,
  SSITextH5LightStyled as HeaderLabel,
  SSITextFieldStatusLabelContainerStyled as StatusLabelContainer
} from '../../../styles/components'
import { ICredentialDetailsRow } from '../../../types'
import SSIStatusLabel from '../../labels/SSIStatusLabel'

export interface IProps {
  item: ICredentialDetailsRow
  index?: number
}

const SSITextField: FC<IProps> = (props: IProps): JSX.Element => {
  const { item, index } = props

  return (
    <Container key={item.id} style={{ marginTop: index === 0 ? 16 : 10 }}>
      <HeaderContainer>
        <HeaderLabel>{item.label}</HeaderLabel>
        {item.status && (
          <StatusLabelContainer>
            <SSIStatusLabel status={item.status} showIcon />
          </StatusLabelContainer>
        )}
      </HeaderContainer>
      <ContentContainer>
        <ContentBadgeContainer>
          {item.isEditable && (
            <EditBadgeContainer>
              <SSIEditIcon />
            </EditBadgeContainer>
          )}
        </ContentBadgeContainer>
        <ContentText>{item.value}</ContentText>
      </ContentContainer>
    </Container>
  )
}

export default SSITextField
