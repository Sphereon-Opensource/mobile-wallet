import {CredentialRole} from '@sphereon/ssi-types';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import {getVerifiableCredential} from '../services/credentialService';
import {evaluateCredentialStatus} from '../services/credentialStatusService';
import {getVerifiableCredentials} from '../store/actions/credential.actions';
import {CredentialStatusResult, WalletCredentialStatus} from '../types/credentialStatus';

export type UseCredentialStatusResult = CredentialStatusResult & {
  isChecking: boolean;
  refresh: () => Promise<void>;
};

/**
 * Re-evaluates a credential's status when the detail screen opens, and exposes a `refresh`
 * callback so the user can re-verify on demand. Returns the current best-known result
 * immediately (VALID until the first check completes) and updates once a check resolves.
 */
export const useCredentialStatus = (
  hash: string,
  credentialRole: CredentialRole,
  initialStatus: WalletCredentialStatus = WalletCredentialStatus.VALID,
): UseCredentialStatusResult => {
  const [result, setResult] = useState<CredentialStatusResult>({status: initialStatus, checkedAt: new Date()});
  const [isChecking, setIsChecking] = useState(false);
  const mounted = useRef(true);
  const dispatch = useDispatch();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const evaluate = useCallback(async (): Promise<void> => {
    setIsChecking(true);
    try {
      const unique = await getVerifiableCredential({credentialRole, hash});
      if (!unique) {
        return;
      }
      const res = await evaluateCredentialStatus(unique);
      if (mounted.current) {
        setResult(res);
      }
      // Refresh the overview summaries when a credential is no longer plain-valid, so the
      // list/card views reflect the new persisted state (filtering + status colour).
      if (res.status !== WalletCredentialStatus.VALID) {
        dispatch<any>(getVerifiableCredentials());
      }
    } catch {
      // Leave the last known result in place on failure.
    } finally {
      if (mounted.current) {
        setIsChecking(false);
      }
    }
  }, [hash, credentialRole]);

  useEffect(() => {
    void evaluate();
  }, [evaluate]);

  return {...result, isChecking, refresh: evaluate};
};
