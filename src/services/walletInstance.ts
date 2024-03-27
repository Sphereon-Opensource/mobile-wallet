/**
 * An instance of the wallet. Protected by pincode and stored in the secure element of the mobile device
 */
export interface WalletInstance {
  id: string;

  name?: string;

  // Hashed and salted version of the pincode
  pinCode: string;

  // The database name and optional path
  database: string;
}
