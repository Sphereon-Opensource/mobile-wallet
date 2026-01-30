import {CredentialsSupportedDisplay} from '@sphereon/oid4vci-common';
import {IBasicCredentialLocaleBranding} from '@sphereon/ssi-sdk.data-store-types';

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
        ...((credentialDisplay.logo as any)?.url && {
          uri: (credentialDisplay.logo as any)?.url,
        }),
        ...((credentialDisplay.logo as any)?.alt_text && {
          alt: (credentialDisplay.logo as any)?.alt_text,
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
            ...((credentialDisplay.background_image as any)?.url && {
              uri: (credentialDisplay.background_image as any)?.url,
            }),
            ...((credentialDisplay.background_image as any)?.alt_text && {
              alt: (credentialDisplay.background_image as any)?.alt_text,
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
