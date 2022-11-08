import { IConnection, IConnectionParty } from '@sphereon/ssi-sdk-data-store-common'
import { IVerifiableCredential } from '@sphereon/ssi-types'
import { CredentialMapper } from '@sphereon/ssi-types'
import { IIdentifier, VerifiableCredential } from '@veramo/core'
import React, { PureComponent } from 'react'
import { Button, Text, View } from 'react-native'
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack'
import { connect } from 'react-redux'

import { CredentialIssuanceStateEnum, HomeRoutesEnum, StackParamList } from '../@types'
import { createIdentifier, getIdentifiers } from '../services/identityService'
import { RootState } from '../store'
import { authenticateConnectionEntity } from '../store/actions/authentication.actions'
import { IAuthenticatedEntity, IOpenIdAuthentication } from '../store/types/authenticate.types'
import { toCredentialSummary } from '../utils/mappers/CredentialMapper'

type Props = NativeStackScreenProps<StackParamList, 'Veramo'>

interface IScreenProps extends Props {
  authenticateEntity: (entityId: string, connection: IConnection) => void
  connectionParties: Array<IConnectionParty>
  authenticationEntities: Array<IAuthenticatedEntity>
}

interface IScreenState {
  identifiers: Array<Identifier>
}

interface Identifier {
  did: string
}

export class Veramo extends PureComponent<IScreenProps, IScreenState> {
  state = {
    identifiers: []
  }

  componentDidMount() {
    getIdentifiers().then((identifiers: Array<IIdentifier>) => {
      console.log('identifiers:', identifiers)
      this.setState({ identifiers })
    })
  }

  createIdentifier = async () => {
    createIdentifier()
      .then((identifier: Identifier) => {
        const identifiers = [identifier, ...this.state.identifiers]
        console.log(identifiers)
        this.setState({ identifiers })
      })
      .catch((error) => console.log(error))
  }

  render() {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Identifiers</Text>
        <View testID="result" style={{ marginBottom: 50, marginTop: 20 }}>
          {this.state.identifiers && this.state.identifiers.length > 0 ? (
            this.state.identifiers.map((identifier: Identifier) => (
              <View key={identifier.did}>
                <Text>{identifier.did}</Text>
              </View>
            ))
          ) : (
            <Text>No identifiers created yet</Text>
          )}
        </View>
        <Button title="Create Identifier" onPress={() => this.createIdentifier()} />
        <View style={{ marginTop: 10 }}>
          <Button
            title="Print connection entities"
            onPress={() => console.log(JSON.stringify(this.props.connectionParties))}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          {this.props.authenticationEntities[0] ? (
            <Text>{`Authenticated user: ${
              (this.props.authenticationEntities[0].authentication as IOpenIdAuthentication).user.firstName
            } ${(this.props.authenticationEntities[0].authentication as IOpenIdAuthentication).user.lastName}`}</Text>
          ) : (
            <Button
              title="Establish connection with Firm24"
              onPress={() => {
                if (this.props.connectionParties[0].id) {
                  this.props.authenticateEntity(
                    this.props.connectionParties[0].id,
                    this.props.connectionParties[0].connections[0]
                  )
                }
              }}
            />
          )}
        </View>
        <View style={{ marginTop: 10 }}>
          <Button
            title="Add Credential"
            onPress={() => {
              const verifiableCredential: IVerifiableCredential = {
                '@context': [
                  'https://www.w3.org/2018/credentials/v1',
                  'https://sphereon-opensource.github.io/vc-contexts/boa/boa-id-v1.jsonld',
                  'https://w3id.org/vc-revocation-list-2020/v1'
                ],
                id: 'bd7acbea-c1b1-46c2-aed5-2022-10-25-00--' + Date.now(),
                title: 'Small Credential',
                issuer: 'Small Credential Issuer',
                issueDate: 1635845889,
                expirationDate: '1735845889',
                properties: [
                  {
                    id: '8655619a-bac9-419e-bf07-d0d2f4bc51a0',
                    label: 'OrganizationName',
                    value: 'Newco. B.V.'
                  }
                ],
                signedBy: 'Firm 24',
                state: CredentialIssuanceStateEnum.OFFER,
                issuanceDate: '2021-12-11T16:32:08.845Z',
                credentialSubject: {
                  givenName: 'Bob',
                  familyName: 'the Builder',
                  idNumber: 'test-123456789',
                  domain: 'IT dept',
                  employer: 'Sphereon',
                  locality: 'My City',
                  validFrom: '2021-11-01T12:45:06Z',
                  id: 'did:lto:3MsS3gqXkcx9m4wYSbfprYfjdZTFmx2ofdX'
                },
                type: ['VerifiableCredential', 'BoaIdCredential'],
                credentialStatus: {
                  id: 'https://vc-api.sphereon.io/services/credentials/justis-boa-id-revocation-prod#22312',
                  type: 'RevocationList2020Status'
                },
                proof: {
                  type: 'Ed25519Signature2018',
                  created: '2021-12-11T16:32:09Z',
                  jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..GyhRSzTjAKchqYrZEp8qfOAP18fBYpOuiZP_0P9xSm5NH9IbVqNJDekkNFgGmadvyfJzi-1_vl9NZxU_TkG3DA',
                  proofPurpose: 'assertionMethod',
                  verificationMethod:
                    'did:factom:402995bdf7042954acfe86d1835e3ada191e96a0b26a320b32e04b7ae9cb1c00#key-0'
                }
              }

              this.props.navigation.navigate(HomeRoutesEnum.CREDENTIAL_DETAILS, {
                rawCredential: verifiableCredential as unknown as VerifiableCredential,
                credential: toCredentialSummary(CredentialMapper.toUniformCredential(verifiableCredential)),
                state: CredentialIssuanceStateEnum.OFFER
              })
            }}
          />
        </View>
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    authenticateEntity: (entityId: string, connection: IConnection) =>
      dispatch(authenticateConnectionEntity(entityId, connection))
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    connectionParties: state.connection.parties,
    authenticationEntities: state.authentication.entities
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Veramo)
