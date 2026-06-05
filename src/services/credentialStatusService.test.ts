import {CredentialStateType} from '@sphereon/ssi-sdk.data-store-types';
import {WalletCredentialStatus} from '../types/credentialStatus';

const mockCrsUpdateCredentialState = jest.fn().mockResolvedValue({});
const mockCrsUpdateCredential = jest.fn().mockResolvedValue({});
const mockLoggerGetActivityEvents = jest.fn().mockResolvedValue([]);
jest.mock('../agent', () => ({
  __esModule: true,
  default: {
    crsUpdateCredentialState: (...a: any[]) => mockCrsUpdateCredentialState(...a),
    crsUpdateCredential: (...a: any[]) => mockCrsUpdateCredential(...a),
    loggerGetActivityEvents: (...a: any[]) => mockLoggerGetActivityEvents(...a),
  },
}));

const mockDispatch = jest.fn().mockResolvedValue(undefined);
jest.mock('../store', () => ({__esModule: true, default: {dispatch: (...a: any[]) => mockDispatch(...a)}}));

const mockStoreActivityLogging = jest.fn((...a: any[]) => ({type: 'STORE_ACTIVITY', args: a}));
jest.mock('../store/actions/logging.actions', () => ({storeActivityLogging: (...a: any[]) => mockStoreActivityLogging(...a)}));

const mockShowToast = jest.fn();
jest.mock('../utils/ToastUtils', () => ({showToast: (...a: any[]) => mockShowToast(...a)}));

jest.mock('../localization/Localization', () => ({translate: (k: string) => k}));

const mockCheckStatusListIndex = jest.fn();
jest.mock('./statusListCheck', () => ({checkStatusListIndex: (...a: any[]) => mockCheckStatusListIndex(...a)}));

import {evaluateCredentialStatus} from './credentialStatusService';

const futureIso = new Date(Date.now() + 86_400_000).toISOString();

const baseCredential = (overrides: any = {}): any => ({
  hash: 'h1',
  digitalCredential: {
    hash: 'h1',
    verifiedState: undefined,
    uniformDocument: JSON.stringify({status: {status_list: {idx: 5, uri: 'https://sl'}}, expirationDate: futureIso}),
    ...overrides,
  },
});

beforeEach(() => jest.clearAllMocks());

describe('evaluateCredentialStatus', () => {
  it('valid->revoked persists REVOKED, logs activity, toasts once', async () => {
    mockCheckStatusListIndex.mockResolvedValue(1);
    const res = await evaluateCredentialStatus(baseCredential());
    expect(res.status).toBe(WalletCredentialStatus.REVOKED);
    expect(mockCrsUpdateCredentialState).toHaveBeenCalledWith(expect.objectContaining({hash: 'h1', verifiedState: CredentialStateType.REVOKED}));
    expect(mockStoreActivityLogging).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledTimes(1);
  });

  it('valid->suspended persists SUSPENDED, logs + toasts', async () => {
    mockCheckStatusListIndex.mockResolvedValue(2);
    const res = await evaluateCredentialStatus(baseCredential());
    expect(res.status).toBe(WalletCredentialStatus.SUSPENDED);
    expect(mockCrsUpdateCredentialState).toHaveBeenCalledWith(expect.objectContaining({verifiedState: CredentialStateType.SUSPENDED}));
    expect(mockShowToast).toHaveBeenCalledTimes(1);
  });

  it('already REVOKED short-circuits, no network, no re-notify', async () => {
    const res = await evaluateCredentialStatus(baseCredential({verifiedState: CredentialStateType.REVOKED}));
    expect(res.status).toBe(WalletCredentialStatus.REVOKED);
    expect(mockCheckStatusListIndex).not.toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockCrsUpdateCredentialState).not.toHaveBeenCalled();
  });

  it('check failure keeps last state, no toast, still stamps last-checked', async () => {
    mockCheckStatusListIndex.mockRejectedValue(new Error('offline'));
    const res = await evaluateCredentialStatus(baseCredential({verifiedState: CredentialStateType.VERIFIED}));
    expect(res.status).toBe(WalletCredentialStatus.VALID);
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockCrsUpdateCredential).toHaveBeenCalledWith(expect.objectContaining({hash: 'h1'}));
  });

  it('unchanged VERIFIED state does not re-notify', async () => {
    mockCheckStatusListIndex.mockResolvedValue(0);
    const res = await evaluateCredentialStatus(baseCredential({verifiedState: CredentialStateType.VERIFIED}));
    expect(res.status).toBe(WalletCredentialStatus.VALID);
    expect(mockShowToast).not.toHaveBeenCalled();
    expect(mockCrsUpdateCredentialState).not.toHaveBeenCalled();
  });

  it('returns statusListInfo for tap-to-expand', async () => {
    mockCheckStatusListIndex.mockResolvedValue(0);
    const res = await evaluateCredentialStatus(baseCredential());
    expect(res.statusListInfo).toEqual({type: 'oauth', uri: 'https://sl', index: 5});
  });
});
