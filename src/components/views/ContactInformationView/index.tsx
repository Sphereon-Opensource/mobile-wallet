import {Party} from '@sphereon/ssi-sdk.data-store';
import {FC} from 'react';
import {ListRenderItemInfo, View, Text} from 'react-native';
import {DETAILS_INITIAL_NUMBER_TO_RENDER} from '../../../@config/constants';
import {ContactDetailsHeaderSection} from './styles';
import {SSICredentialDetailsViewContainerStyled as Container, SSIDetailsViewDetailsListStyled as DetailsList} from '../../../styles/components';
import SSIImageField from '../../../components/fields/SSIImageField';
import SSITextField from '../../../components/fields/SSITextField';
import {CredentialDetailsRow} from '@sphereon/ui-components.credential-branding';
import {ITabViewRoute} from '../../../types';
import {translate} from '../../../localization/Localization';
import SSITabView from '../../../components/views/SSITabView';
import {NewContactViewItem} from '../NewContactViewItem';

export interface IProps {
  properties: Array<CredentialDetailsRow>;
}

export const ContactDetailsView: FC<IProps> = (props: IProps): JSX.Element => {
  const renderItem = (itemInfo: ListRenderItemInfo<CredentialDetailsRow>) => {
    if (itemInfo.item.imageSize) {
      return <SSIImageField item={itemInfo.item} index={itemInfo.index} />;
    } else {
      return <SSITextField item={itemInfo.item} index={itemInfo.index} />;
    }
  };

  return (
    <Container>
      <DetailsList
        data={props.properties.filter(p => p.value !== undefined)}
        renderItem={renderItem}
        keyExtractor={(item: CredentialDetailsRow) => item.id}
        initialNumToRender={DETAILS_INITIAL_NUMBER_TO_RENDER}
        removeClippedSubviews
      />
    </Container>
  );
};

export type ContactInformationProps = {
  contact: Party;
};

export const ContactInformationView = (props: ContactInformationProps) => {
  const contactDetails = [
    {
      id: 'Name',
      label: 'Name',
      value: 'name',
    },
    {
      id: 'alias',
      label: 'Alias name',
      value: props.contact.branding?.alias,
    },
    {
      id: 'website',
      label: 'Website',
      value: props.contact.branding?.clientUri,
    },
    {
      id: 'description',
      label: 'Description',
      value: props.contact.branding?.description,
    },
    {
      id: 'tos_url',
      label: 'Terms of Service',
      value: props.contact.branding?.tosUri,
    },
    {
      id: 'privacy_url',
      label: 'Privacy Policy',
      value: props.contact.branding?.policyUri,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      value: props.contact.branding?.contacts,
    },
  ];

  const routes: Array<ITabViewRoute> = [
    {
      key: 'Details',
      title: translate('contact_details_info_tab_header_label'),
      content: () => <ContactDetailsView properties={contactDetails} />,
    },
  ];
  return (
    <View style={{flex: 1}}>
      <ContactDetailsHeaderSection>
        <NewContactViewItem
          name={props.contact.contact.displayName}
          uri={props.contact.uri}
          roles={props.contact.roles}
          logo={props.contact.branding?.logo}
          verified={true}
        />
      </ContactDetailsHeaderSection>
      <SSITabView routes={routes} />
    </View>
  );
};
