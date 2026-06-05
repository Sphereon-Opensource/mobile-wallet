import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {WalletCredentialStatus} from '../types/credentialStatus';
import {extractStatusListInfo, filterOutStatusListRows, isStatusListProperty, mapToWalletStatus} from './credentialStatus';

describe('extractStatusListInfo', () => {
  it('reads IETF SD-JWT status_list (idx + uri)', () => {
    const doc = {status: {status_list: {idx: 12344, uri: 'https://statuslist.uri'}}};
    expect(extractStatusListInfo(doc)).toEqual({type: 'oauth', uri: 'https://statuslist.uri', index: 12344});
  });

  it('reads W3C BitstringStatusListEntry', () => {
    const doc = {
      credentialStatus: {
        type: 'BitstringStatusListEntry',
        statusListIndex: '94567',
        statusListCredential: 'https://example.com/status/1',
      },
    };
    expect(extractStatusListInfo(doc)).toEqual({type: 'bitstring', uri: 'https://example.com/status/1', index: 94567});
  });

  it('reads W3C StatusList2021Entry (array form)', () => {
    const doc = {
      credentialStatus: [
        {
          type: 'StatusList2021Entry',
          statusListIndex: 7,
          statusListCredential: 'https://example.com/sl/1',
        },
      ],
    };
    expect(extractStatusListInfo(doc)).toEqual({type: 'statuslist2021', uri: 'https://example.com/sl/1', index: 7});
  });

  it('returns undefined when no status mechanism', () => {
    expect(extractStatusListInfo({foo: 'bar'})).toBeUndefined();
    expect(extractStatusListInfo(undefined)).toBeUndefined();
  });
});

describe('isStatusListProperty', () => {
  it('matches status-list subtree roots by label', () => {
    expect(isStatusListProperty({id: 'uuid-1', label: 'status', value: ''} as any)).toBe(true);
    expect(isStatusListProperty({id: 'uuid-2', label: 'status_list', value: ''} as any)).toBe(true);
    expect(isStatusListProperty({id: 'uuid-3', label: 'credentialStatus', value: ''} as any)).toBe(true);
  });
  it('does not match leaf or normal claims by label', () => {
    expect(isStatusListProperty({id: 'uuid-4', label: 'idx', value: 1} as any)).toBe(false);
    expect(isStatusListProperty({id: 'uuid-5', label: 'given_name', value: 'A'} as any)).toBe(false);
  });
});

describe('filterOutStatusListRows', () => {
  it('drops the status subtree including orphaned idx/uri leaves (random uuid ids, depth-ordered)', () => {
    const rows = [
      {id: 'a', label: 'Given Name', value: 'Jan', depth: 0},
      {id: 'b', label: 'status', value: '', depth: 0},
      {id: 'c', label: 'status_list', value: '', depth: 1},
      {id: 'd', label: 'idx', value: 7567, depth: 2},
      {id: 'e', label: 'uri', value: 'https://sl', depth: 2},
      {id: 'f', label: 'subject', value: 'Niels', depth: 0},
    ] as any;
    expect(filterOutStatusListRows(rows).map(r => r.label)).toEqual(['Given Name', 'subject']);
  });

  it('drops a W3C credentialStatus subtree', () => {
    const rows = [
      {id: 'a', label: 'Given Name', value: 'Jan', depth: 0},
      {id: 'b', label: 'credentialStatus', value: '', depth: 0},
      {id: 'c', label: 'statusListIndex', value: 7, depth: 1},
      {id: 'd', label: 'statusListCredential', value: 'https://sl', depth: 1},
      {id: 'e', label: 'Email', value: 'x@y', depth: 0},
    ] as any;
    expect(filterOutStatusListRows(rows).map(r => r.label)).toEqual(['Given Name', 'Email']);
  });

  it('keeps everything when there is no status-list subtree', () => {
    const rows = [
      {id: 'a', label: 'Given Name', value: 'Jan', depth: 0},
      {id: 'b', label: 'Email', value: 'x@y', depth: 0},
    ] as any;
    expect(filterOutStatusListRows(rows).map(r => r.label)).toEqual(['Given Name', 'Email']);
  });
});

describe('mapToWalletStatus', () => {
  const future = new Date(Date.now() + 86_400_000);
  const past = new Date(Date.now() - 86_400_000);

  it('persisted REVOKED always wins', () => {
    expect(mapToWalletStatus({checkResult: 0, expirationDate: future, persistedState: CredentialStateType.REVOKED})).toBe(
      WalletCredentialStatus.REVOKED,
    );
  });
  it('OAuth Suspended -> SUSPENDED', () => {
    expect(mapToWalletStatus({checkResult: 2, expirationDate: future})).toBe(WalletCredentialStatus.SUSPENDED);
  });
  it('Invalid -> REVOKED', () => {
    expect(mapToWalletStatus({checkResult: 1, expirationDate: future})).toBe(WalletCredentialStatus.REVOKED);
  });
  it('Valid + not expired -> VALID', () => {
    expect(mapToWalletStatus({checkResult: 0, expirationDate: future})).toBe(WalletCredentialStatus.VALID);
  });
  it('Valid + expired -> EXPIRED', () => {
    expect(mapToWalletStatus({checkResult: 0, expirationDate: past})).toBe(WalletCredentialStatus.EXPIRED);
  });
  it('no status list, not expired -> VALID', () => {
    expect(mapToWalletStatus({checkResult: undefined, expirationDate: future})).toBe(WalletCredentialStatus.VALID);
  });
  it('no status list, expired -> EXPIRED', () => {
    expect(mapToWalletStatus({checkResult: undefined, expirationDate: past})).toBe(WalletCredentialStatus.EXPIRED);
  });
  it('check failed -> keep last persisted (VERIFIED -> VALID)', () => {
    expect(mapToWalletStatus({checkResult: 'ERROR', expirationDate: future, persistedState: CredentialStateType.VERIFIED})).toBe(
      WalletCredentialStatus.VALID,
    );
  });
  it('check failed + expired -> EXPIRED overlay on kept state', () => {
    expect(mapToWalletStatus({checkResult: 'ERROR', expirationDate: past, persistedState: CredentialStateType.VERIFIED})).toBe(
      WalletCredentialStatus.EXPIRED,
    );
  });
  it('signature/trust could not be verified -> INVALID (no signal honored)', () => {
    expect(mapToWalletStatus({checkResult: 'UNTRUSTED', expirationDate: future, persistedState: CredentialStateType.VERIFIED})).toBe(
      WalletCredentialStatus.UNTRUSTED,
    );
  });
  it('INVALID does not override a permanent persisted REVOKED', () => {
    expect(mapToWalletStatus({checkResult: 'UNTRUSTED', persistedState: CredentialStateType.REVOKED})).toBe(WalletCredentialStatus.REVOKED);
  });
  it('INVALID takes precedence over expiry (status trust is the surfaced concern)', () => {
    expect(mapToWalletStatus({checkResult: 'UNTRUSTED', expirationDate: past})).toBe(WalletCredentialStatus.UNTRUSTED);
  });
});
