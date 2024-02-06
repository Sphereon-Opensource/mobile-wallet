export interface IssuerConnection {
  issuerUrl: string;
  clientId: string;
  redirectUri: string;
  proxyTokenUrl?: string;
}

export interface AuthorizationRequest extends Record<string, string> {
  // (CommonAuthorizationRequest is missing nonce and  Record<string, string> is easier to pass to URLSearchParams)

  scope: string;
  response_type: string;
  client_id: string;
  redirect_uri: string;
  nonce: string;
  code_challenge: string;
  code_challenge_method: string;
  acr_values: string;
}

export interface AuthorizationRequestState {
  authorizationRequest: AuthorizationRequest;
  codeVerifier: string;
}

export interface AuthorizationCodeResponse {
  code: string;
  nonce: string;
}
