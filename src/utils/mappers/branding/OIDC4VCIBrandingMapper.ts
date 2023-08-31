import {CredentialsSupportedDisplay} from '@sphereon/oid4vci-common';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store';

export const credentialLocaleBrandingFrom = async (credentialDisplay: CredentialsSupportedDisplay): Promise<IBasicCredentialLocaleBranding> => {
  return {
    ...(credentialDisplay.name && {
      alias: credentialDisplay.name,
    }),
    ...(credentialDisplay.locale && {
      locale: credentialDisplay.locale,
    }),
    ...(credentialDisplay.logo && {
      logo: {
        ...(credentialDisplay.logo.url && {
          uri: credentialDisplay.logo?.url,
        }),
        ...(credentialDisplay.logo.alt_text && {
          alt: credentialDisplay.logo?.alt_text,
        }),
      },
    }),
    ...(credentialDisplay.description && {
      description: credentialDisplay.description,
    }),

    ...(credentialDisplay.text_color && {
      text: {
        color: credentialDisplay.text_color,
      },
    }),
    ...((credentialDisplay.background_image || credentialDisplay.background_color) && {
      background: {
        ...(credentialDisplay.background_image && {
          image: {
            ...(credentialDisplay.background_image.url && {
              uri: credentialDisplay.background_image?.url,
            }),
            ...(credentialDisplay.background_image.alt_text && {
              alt: credentialDisplay.background_image?.alt_text,
            }),
          },
        }),
        ...(credentialDisplay.background_color && {
          color: credentialDisplay.background_color,
        }),
      },
    }),
  };
};
