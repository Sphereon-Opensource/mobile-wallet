export const OVERVIEW_INITIAL_NUMBER_TO_RENDER = 10 /* Sets the initial list render amount of the overview screen. */
export const DETAILS_INITIAL_NUMBER_TO_RENDER = 15 /* Sets the initial list render amount of the details screen. */
export const HIT_SLOP_DISTANCE = 5 /* Sets the additional distance outside the elements in which a press can be detected. */
export const QR_SCANNER_TIMEOUT = {
  reactivate: 5000
} /* Sets the reactivation timeout for the qr code scanner. */

// TODO we want this as an env var, but i read that just creating an .env does not work for expo. Needs to be figured out
export const SPHEREON_UNIRESOLVER_RESOLVE_URL = 'https://uniresolver.test.sphereon.io/1.0/identifiers'
export const DIF_UNIRESOLVER_RESOLVE_URL = 'https://dev.uniresolver.io/1.0/identifiers'

export const APP_ID = 'sphereon:ssi-wallet'
export const DID_PREFIX = 'did'

export const MAX_CONTACT_ALIAS_LENGTH = 50
export const EMAIL_ADDRESS_VALIDATION_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
