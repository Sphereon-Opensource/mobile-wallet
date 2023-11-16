import {IServerMetadataAndCryptoMatchingResponse} from '../types';
import {getIssuerDisplays} from './qrService';

function getOID4VVciName(metadata: IServerMetadataAndCryptoMatchingResponse, url: string) {
  const displays = metadata.serverMetadata.credentialIssuerMetadata ? getIssuerDisplays(metadata.serverMetadata.credentialIssuerMetadata) : [];
  let name;
  for (const display of displays) {
    if (display.name) {
      name = display.name;
      break;
    }
  }
  if (!name) {
    name = url;
  }
  return name;
}
