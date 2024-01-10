import fetch from 'cross-fetch';
import OpenId4VcIssuanceProvider from '../providers/credential/OpenId4VcIssuanceProvider';

const ISSUER_URL = 'https://esignet.collab.mosip.net';
const TOKEN_PROXY_ENDPOINT = 'http://192.168.1.200:3300/token';
const CLIENT_ID = 'MUq1H5M4OBr9fxSC2fJrY4felRmxtDw4iRls2lBZQzI';
const REDIRECT_URI = 'com.sphereon.ssi.wallet://credentials';

export const handleESignetFlow = async (nonce: string, code: string): Promise<void> => {
  const body = JSON.stringify({
    code: code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
  });

  try {
    const response = await fetch(TOKEN_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Process response data here if needed
    const data = await response.json();
    if ('access_token' in data) {
      const oid4VcProvider = await OpenId4VcIssuanceProvider.initiationFromIssuer({issuer: ISSUER_URL, clientId: CLIENT_ID});
      oid4VcProvider//      const grants = `{\"authorization_code\":{\"issuer_state\":\"${data.access_token}\"}}`
      //     const initiateUri = `openid-credential-offer://?credential_issuer=${encodeURIComponent(ISSUER_URL)}&grants=${encodeURIComponent(grants)}&client_id=${encodeURIComponent(CLIENT_ID)}&credentials=${encodeURIComponent('[]')}`
      .console
        .log(JSON.stringify(oid4VcProvider));
    } else {
      console.error('The response did not contain the required access_token');
    }
  } catch (error) {
    console.error('There was an error!', error);
  }
};
