import { NativeStackScreenProps } from '@react-navigation/native-stack'
import React, { FC } from 'react'

import SSIActivityView from '../../components/views/SSIActivityView'
import SSIConnectionsView from '../../components/views/SSIConnectionsView'
import SSIContactViewItem from '../../components/views/SSIContactViewItem'
import SSITabView from '../../components/views/SSITabView'
import { translate } from '../../localization/Localization'
import { SSIBasicContainerSecondaryStyled as Container } from '../../styles/components'
import { ScreenRoutesEnum, StackParamList } from '../../types'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>

enum ContactTabRoutesEnum {
  INFO = 'info',
  CONNECTIONS = 'connections',
  ACTIVITY = 'activity'
}

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const { contact, showActivity = false } = props.route.params

  const routes = [
    {
      key: ContactTabRoutesEnum.INFO,
      title: translate('contact_details_info_tab_header_label'),
      // TODO WAL-350 implement content
      content: () => <SSIActivityView />
    },
    {
      key: ContactTabRoutesEnum.CONNECTIONS,
      title: translate('contact_details_connections_tab_header_label'),
      content: () => <SSIConnectionsView connections={contact.connections} />
    },
    ...(showActivity? [{
      key: ContactTabRoutesEnum.ACTIVITY,
      title: translate('contact_details_activity_tab_header_label'),
      // TODO WAL-358 implement content
      content: () => <SSIActivityView />
    }]: [])
  ]

  // TODO contact roles should be an aggregate of the roles on the identities
  return (
    <Container>
      <SSIContactViewItem id={contact.id} name={contact.alias} uri={contact.uri} roles={[]} />
      <SSITabView routes={routes} />
    </Container>
  )
}

export default SSIContactDetailsScreen
