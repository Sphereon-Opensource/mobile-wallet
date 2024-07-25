import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {FC} from 'react';

import SSIActivityView from '../../components/views/SSIActivityView';
import SSIContactViewItem from '../../components/views/SSIContactViewItem';
import SSIIdentitiesView from '../../components/views/SSIIdentitiesView';
import SSITabView from '../../components/views/SSITabView';
import {translate} from '../../localization/Localization';
import {SSIBasicContainerSecondaryStyled as Container} from '../../styles/components';
import {ITabViewRoute, ScreenRoutesEnum, StackParamList} from '../../types';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.CONTACT_DETAILS>;

enum ContactTabRoutesEnum {
  INFO = 'info',
  IDENTITIES = 'identities',
  ACTIVITY = 'activity',
}

const SSIContactDetailsScreen: FC<Props> = (props: Props): JSX.Element => {
  const {contact} = props.route.params;

  const routes: Array<ITabViewRoute> = [
    // {
    //   key: ContactTabRoutesEnum.INFO,
    //   title: translate('contact_details_info_tab_header_label'),
    //   // TODO WAL-584 implement content
    //   content: () => <SSIActivityView />,
    // },
    {
      key: ContactTabRoutesEnum.IDENTITIES,
      title: translate('contact_details_identities_tab_header_label'),
      content: () => <SSIIdentitiesView identities={contact.identities} />,
    },
    // {
    //   key: ContactTabRoutesEnum.ACTIVITY,
    //   title: translate('contact_details_activity_tab_header_label'),
    //   // TODO WAL-358 implement content
    //   content: () => <SSIActivityView />
    // }
  ];

  return (
    <Container>
      <SSIContactViewItem name={contact.contact.displayName} uri={contact.uri} roles={contact.roles} logo={contact.branding?.logo} />
      <SSITabView routes={routes} />
    </Container>
  );
};

export default SSIContactDetailsScreen;
