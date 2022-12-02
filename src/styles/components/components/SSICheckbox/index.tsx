import styled from 'styled-components/native'

import { selectionElements } from '../../../colors'

export const SSICheckboxUnselectedContainerStyled = styled.View`
  width: 16px;
  aspect-ratio: 1;
  border-radius: 8px;
  border-width: 1px;
  border-color: ${selectionElements.primaryBorderDark};
  align-items: center;
  justify-content: center;
`

export const SSICheckboxSelectedContainerStyled = styled.View`
  width: 11.26px;
  aspect-ratio: 1;
  border-radius: 5.63px;
  background-color: ${selectionElements.primaryDark};
  align-items: center;
  justify-content: center;
`
