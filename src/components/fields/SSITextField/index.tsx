import React, { FC } from 'react'
import { Text, View } from 'react-native'

import { ICredentialDetailsRow } from '../../../@types'
import SSIEditIcon from '../../../assets/icons/edit.svg'
import { SSIFlexDirectionRowViewStyled as HorizontalContainer } from '../../../styles/styledComponents'
import SSIStatusLabel from '../../labels/SSIStatusLabel'

export interface IProps {
  item: ICredentialDetailsRow
  index?: number
}

// TODO create styling components
const SSITextField: FC<IProps> = (props: IProps): JSX.Element => {
  const { item, index } = props

  return (
    <View
      key={item.id}
      style={{
        width: '100%',
        marginTop: index === 0 ? 16 : 10,
        paddingTop: 2,
        paddingRight: 24,
        paddingBottom: 4
      }}
    >
      <HorizontalContainer style={{ paddingLeft: 24 }}>
        <Text style={{ fontSize: 10, lineHeight: 15, fontWeight: '400', color: '#FBFBFB' }}>{item.label}</Text>
        {item.status && (
          <View style={{ marginLeft: 5 }}>
            <SSIStatusLabel status={item.status} showIcon />
          </View>
        )}
      </HorizontalContainer>
      <HorizontalContainer>
        <View style={{ width: 24 }}>
          {item.isEditable && (
            <View style={{ marginTop: 3, marginBottom: 'auto', marginLeft: 'auto', marginRight: 'auto' }}>
              <SSIEditIcon />
            </View>
          )}
        </View>
        <View>
          <Text style={{ fontSize: 12, lineHeight: 18, fontWeight: '600', color: '#FBFBFB' }}>{item.value}</Text>
        </View>
      </HorizontalContainer>
    </View>
  )
}

export default SSITextField
