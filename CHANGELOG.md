# Change Log

All notable changes to this project will be documented in this file.

# [0.3.0](https://github.com/Sphereon-Opensource/mobile-wallet/compare/v0.1.3...v0.2.0) (2024-08-01)

The license of the wallet has been made more permissive. We moved from GPLv3 to Apache2.

### Improvements

- Support for newer OID4VC specifications (OID4VP v20, OID4VCI v13/ID1, SIOP v13)
- Add support for issuer branding (logo)
- New faster database
- New datastore allowing for storage of different types of credentials (SD-JWT, JWT, mDl/mdoc), presentations and future remote storage
- New crypto implementation that is much faster
- Update to latest expo (v51) and react-native (v0.74)

# [0.2.0](https://github.com/Sphereon-Opensource/mobile-wallet/compare/v0.1.3...v0.2.0) (2024-03-28)

This release contains many improvements, including support for newer versions of the OID4VC specifications and EBSI support.
Be aware that we moved to a new secure store implementation, meaning you will have to onboard again.

### Improvements

- Support for newer OID4VC specifications (OID4VP v18, OID4VCI v12, SIOP v13)
- Support for EBSI
- Support for SIOP only flows
- Better separation of logic and screens, using Xstate, allowing re-use between mobile and cloud wallet
- Only lock after an inactivity timeout for Android and IOS
- Better URL handling mechanisms for deeplinks
- Use latest expo (v50) and react-native
- Allow issuer name in a VC itself
- Add Emergency Screen support
- New storage and secure storage implementation using secure elements

### Bug Fixes

- Show debug logs when configured in environment or .env files
- Sometimes all available credentials were shown in a SIOP flow when nothing matched
- Invalid point format on certain keys when converting from hex to JWK encodings

# 0.1.3 (2023-09-29)

### Improvements

- Better method matching in Verifiable Credential Issuance flows

### Bug Fixes

- Format matching problem in Verifiable Credential Issuance flows
- Background color of cards not respected when set by issuer metadata
- Intent, deeplink and lock fixes
