import {NativeEventEmitter, NativeModules, Platform} from 'react-native';

const DCApiModule = Platform.OS === 'android' ? NativeModules.DCApiModule : null;

export interface DCApiRequest {
  requestJson: string;
  origin: string;
  packageName: string;
  selectedCredentialId: string;
}

export const registerDCApiCredentials = (credentialMetadataJson: string): Promise<void> => {
  return DCApiModule?.registerCredentials(credentialMetadataJson);
};

export const sendDCApiResponse = (responseJson: string): void => {
  DCApiModule?.sendResponse(responseJson);
};

export const authenticateAndSendDCApiResponse = (responseJson: string, title: string, subtitle: string): Promise<boolean> => {
  if (!DCApiModule) {
    return Promise.resolve(false);
  }
  return DCApiModule.authenticateAndSendResponse(responseJson, title, subtitle);
};

export const sendDCApiError = (error: string): void => {
  DCApiModule?.sendError(error);
};

export const isDCApiActivity = (): boolean => {
  return DCApiModule?.isDCApiActivity() ?? false;
};

export const getDCApiRequestFromNative = (): Promise<DCApiRequest | undefined> => {
  if (!DCApiModule) {
    return Promise.resolve(undefined);
  }
  return DCApiModule.getRequest().catch(() => undefined);
};

let dcApiEventEmitter: NativeEventEmitter | null = null;

export const subscribeToDCApiRequests = (callback: (request: DCApiRequest) => void): (() => void) => {
  if (!DCApiModule) {
    return () => {};
  }
  if (!dcApiEventEmitter) {
    dcApiEventEmitter = new NativeEventEmitter(DCApiModule);
  }
  const subscription = dcApiEventEmitter.addListener('onDCApiRequest', callback);
  return () => subscription.remove();
};

export const resetDCApiState = (): void => {
  DCApiModule?.resetDCApiState();
};

export const waitForBiometricResult = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!DCApiModule) {
      resolve(true);
      return;
    }

    // Check if the biometric result was already stored (race condition: biometric
    // completed before we registered the listener)
    DCApiModule.getBiometricResult().then((result: boolean | null) => {
      if (result !== null && result !== undefined) {
        console.log('[dcApiService] getBiometricResult returned stored result:', result);
        resolve(result);
        return;
      }

      // No result yet, listen for the event
      if (!dcApiEventEmitter) {
        dcApiEventEmitter = new NativeEventEmitter(DCApiModule);
      }
      const subscription = dcApiEventEmitter.addListener('onDCApiBiometricResult', (event: {success: boolean}) => {
        subscription.remove();
        resolve(event.success);
      });
    });
  });
};
