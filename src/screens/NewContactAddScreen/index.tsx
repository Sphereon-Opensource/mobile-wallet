import React, {FC, ReactElement} from 'react';
import {View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SSIBasicContainerStyled as Container} from '../../styles/components';
import {ScreenRoutesEnum, StackParamList} from '../../types';
import FederationTrustView from '../../components/views/FederationTrustView';
import {PrimaryButton, SecondaryButton} from '@sphereon/ui-components.ssi-react-native';
import {ContactInformationView} from '../../components/views/ContactInformationView';
import {PartyOrigin, PartyTypeType} from '@sphereon/ssi-sdk.data-store';

type Props = NativeStackScreenProps<StackParamList, ScreenRoutesEnum.NEW_CONTACT_ADD>;

const NewContactAddScreen: FC<Props> = (props: Props): ReactElement => {
  const {partyName, federations} = props.route.params;

  return (
    <Container>
      {federations !== undefined && (
        <FederationTrustView
          partyName={partyName}
          federations={federations}
          style={{marginTop: 12, marginBottom: 24, marginRight: 24, marginLeft: 24}}
        />
      )}
      <ContactInformationView
        contact={{
          id: '96ef563c-419d-464f-a0f1-9fe1c46767b7',
          uri: 'example.com',
          roles: [],
          identities: [],
          electronicAddresses: [],
          physicalAddresses: [],
          relationships: [],
          partyType: {
            id: 'cf7e12c8-f5d4-44f2-8027-7cd0de54da28',
            type: PartyTypeType.NATURAL_PERSON,
            origin: PartyOrigin.EXTERNAL,
            name: 'example_name',
            tenantId: '0605761c-4113-4ce5-a6b2-9cbae2f9d289',
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          contact: {
            id: '37bb6e0f-2fb6-4940-babc-8d26baa0e842',
            firstName: 'example_first_name',
            middleName: 'example_middle_name',
            lastName: 'example_last_name',
            displayName: 'example_display_name',
            metadata: [],
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
          },
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
        }}
      />
      <View style={{paddingTop: 36, paddingBottom: 36, paddingLeft: 24, paddingRight: 24, marginTop: 'auto', gap: 12}}>
        <PrimaryButton caption={'Yes, continue'} onPress={() => console.log(`Yes, continue pressed`)} />
        <SecondaryButton caption={'Abort'} onPress={() => console.log(`Abort pressed`)} />
      </View>
    </Container>
  );
};

export default NewContactAddScreen;
