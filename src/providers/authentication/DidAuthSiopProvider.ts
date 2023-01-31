import { VerifiedAuthorizationRequest } from '@sphereon/did-auth-siop'
import { IDidAuthConfig } from '@sphereon/ssi-sdk-data-store-common'
import { IAuthRequestDetails, IResponse, OpSession } from '@sphereon/ssi-sdk-did-auth-siop-authenticator'
import { IVerifiableCredential } from '@sphereon/ssi-types'
import { IIdentifier, UniqueVerifiableCredential } from '@veramo/core'
import Debug from 'debug'

import { APP_ID } from '../../@config/constants'
import { CustomApproval } from '../../@types'
import {
  authenticateWithSiop,
  getSessionForSiop,
  getSiopAuthenticationRequestDetails,
  registerSessionForSiop,
  sendSiopAuthenticationResponse
} from '../../agent'
import { getVerifiableCredentialsFromStorage } from '../../services/credentialService'

const debug = Debug(`${APP_ID}:authentication`)

class DidAuthSiopProvider {
  public authenticate = async (config: IDidAuthConfig, customApproval?: CustomApproval): Promise<Response> => {
    await this.getSession(config.sessionId).catch(
      async () => await this.registerSession(config.sessionId, config.identifier)
    )

    const authenticationArgs = {
      sessionId: config.sessionId,
      stateId: config.stateId,
      redirectUrl: config.redirectUrl,
      customApproval
    }

    return authenticateWithSiop(authenticationArgs)
      .then((response: IResponse) => {
        debug(`Authentication success for sessionId: ${config.sessionId}`)
        return response
      })
      .catch((error: Error) => {
        debug(`Authentication failed for sessionId: ${config.sessionId}`)
        return Promise.reject(error)
      })
  }

  public verifyAuthentication = async (
    sessionId: string,
    verifiedAuthorizationRequest: VerifiedAuthorizationRequest
  ): Promise<IResponse> => {
    return getVerifiableCredentialsFromStorage()
      .then((verifiableCredentials: Array<UniqueVerifiableCredential>) =>
        getSiopAuthenticationRequestDetails({
          sessionId,
          verifiedAuthorizationRequest,
          // TODO fix mismatching dep versions
          verifiableCredentials: verifiableCredentials.map((vc) => <IVerifiableCredential>vc.verifiableCredential)
        })
      )
      .then((verification: IAuthRequestDetails) => {
        if (verification.vpResponseOpts.length <= 0) {
          return Promise.reject(Error('No valid credentials supplied'))
        }

        return sendSiopAuthenticationResponse({
          sessionId,
          verifiedAuthorizationRequest,
          verifiablePresentationResponse: verification.vpResponseOpts
        })
      })
  }

  public revokeToken = async (config: IDidAuthConfig, token: string): Promise<void> => {
    // TODO fully implement, this is just a dummy function
    console.log(`config: ${config}, token: ${token}`)
    return Promise.reject(Error('Not yet implemented'))
  }

  public getSession = async (sessionId: string): Promise<OpSession> => {
    return getSessionForSiop({ sessionId })
  }

  public registerSession = async (sessionId: string, identifier: IIdentifier): Promise<OpSession> => {
    return registerSessionForSiop({
      sessionId,
      identifier
    })
  }
}

export default DidAuthSiopProvider
