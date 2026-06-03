import Debug, {Debugger} from 'debug';
import {APP_ID} from '../@config/constants';
import {animoFunkeCert, funkeTestCA, sphereonCA, sphereonFunke} from '../@config/trustanchors';

const debug: Debugger = Debug(`${APP_ID}:trustAnchorRegistry`);

// Built-in defaults preserved from the previous hardcoded plugin config.
const BUILTIN_CA_ANCHORS: Array<string> = [sphereonCA, funkeTestCA, sphereonFunke];
const BUILTIN_BLIND_ANCHORS: Array<string> = [animoFunkeCert];

let userCaAnchors: Array<string> = [];
let userBlindAnchors: Array<string> = [];

/** Regular trust anchors (CA certs / self-signed roots) — read lazily by the plugin providers. */
export const getX5cTrustAnchors = (): Array<string> => [...BUILTIN_CA_ANCHORS, ...userCaAnchors];

/** Self-signed leaf certs the user chose to trust without a CA chain. */
export const getBlindlyTrustedAnchors = (): Array<string> => [...BUILTIN_BLIND_ANCHORS, ...userBlindAnchors];

/** Replace the user-supplied anchor cache (call after any add/remove or on startup). */
export const setUserAnchors = (anchors: {ca: Array<string>; blind: Array<string>}): void => {
  userCaAnchors = [...anchors.ca];
  userBlindAnchors = [...anchors.blind];
  debug(`trust anchors refreshed: ${userCaAnchors.length} CA + ${userBlindAnchors.length} blind (plus built-ins)`);
};

/** Load user anchors from storage into the cache. Safe to call fire-and-forget at startup. */
export const refreshFromStorage = async (): Promise<void> => {
  try {
    const {getX5cAnchorPems} = await import('../services/trustAnchor/trustAnchorService');
    setUserAnchors(await getX5cAnchorPems());
  } catch (error) {
    debug(`refreshFromStorage failed (using built-in anchors only): ${error}`);
  }
};

// Test-only seam.
export const __setUserAnchorsForTest = setUserAnchors;
