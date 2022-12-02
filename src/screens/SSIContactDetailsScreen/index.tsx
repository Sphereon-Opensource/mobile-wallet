import React, { FC } from 'react'
import { NativeStackScreenProps } from 'react-native-screens/native-stack'

import { ScreenRoutesEnum, StackParamList } from '../../@types'
import SSIActivityView from '../../components/views/SSIActivityView'
import SSIConnectionsView from '../../components/views/SSIConnectionsView'
import SSIContactViewItem from '../../components/views/SSIContactViewItem'
import SSITabView from '../../components/views/SSITabView'
import { translate } from '../../localization/Localization'
import { SSIBasicContainerSecondaryStyled as Container } from '../../styles/components'

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>

enum ContactTabRoutesEnum {
  INFO = 'info',
  CONNECTIONS = 'connections',
  ACTIVITY = 'activity'
}

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const { contact } = props.route.params

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
    {
      key: ContactTabRoutesEnum.ACTIVITY,
      title: translate('contact_details_activity_tab_header_label'),
      // TODO WAL-358 implement content
      content: () => <SSIActivityView />
    }
  ]

  return (
    <Container>
      <SSIContactViewItem id={contact.id} name={contact.alias} uri={contact.uri} role={contact.role} />
      <SSITabView routes={routes} />
    </Container>
  )
}

export default SSIContactDetailsScreen
