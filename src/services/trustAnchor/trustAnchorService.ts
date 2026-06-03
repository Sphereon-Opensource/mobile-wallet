import Debug, {Debugger} from 'debug';
import {DataSource} from 'typeorm';
import {v4 as uuidv4} from 'uuid';
import {APP_ID} from '../../@config/constants';
import {TrustAnchorEntity, TrustAnchorMode} from '../../entities/TrustAnchorEntity';
import {DEFAULT_DB_CONNECTION} from '../databaseService';
import {IAddTrustAnchorArgs, ITrustAnchor} from '../../types/store/trustAnchor.types';
import {parseCertificate} from './certificateParser';

const debug: Debugger = Debug(`${APP_ID}:trustAnchorService`);

const toViewModel = (entity: TrustAnchorEntity): ITrustAnchor => ({
  id: entity.id,
  type: entity.type,
  label: entity.label,
  value: entity.value,
  trustMode: entity.trustMode,
  subjectDN: entity.subjectDN,
  issuerDN: entity.issuerDN,
  notBefore: entity.notBefore?.toISOString(),
  notAfter: entity.notAfter?.toISOString(),
  fingerprintSha256: entity.fingerprintSha256,
  source: entity.source,
  createdAt: entity.createdAt?.toISOString() ?? new Date().toISOString(),
});

const getRepo = async () => {
  const ds: DataSource = await DEFAULT_DB_CONNECTION;
  return ds.getRepository(TrustAnchorEntity);
};

export const getTrustAnchors = async (): Promise<Array<ITrustAnchor>> => {
  const repo = await getRepo();
  const rows = await repo.find({order: {createdAt: 'DESC'}});
  return rows.map(toViewModel);
};

export const addTrustAnchor = async (args: IAddTrustAnchorArgs): Promise<ITrustAnchor> => {
  debug(`addTrustAnchor(type=${args.type}, source=${args.source})...`);
  const repo = await getRepo();
  const entity = new TrustAnchorEntity();
  entity.id = uuidv4();
  entity.label = args.label;
  entity.type = args.type;
  entity.source = args.source;

  if (args.type === 'x5c') {
    const info = await parseCertificate(args.value);
    const mode: TrustAnchorMode = args.trustMode ?? (info.isCA ? 'ca' : 'blind');
    // Dedupe by fingerprint.
    const existing = await repo.findOne({where: {fingerprintSha256: info.fingerprintSha256}});
    if (existing) {
      return Promise.reject(new Error('This certificate is already a trust anchor'));
    }
    entity.value = info.pem;
    entity.trustMode = mode;
    entity.subjectDN = info.subjectDN;
    entity.issuerDN = info.issuerDN;
    entity.notBefore = info.notBefore;
    entity.notAfter = info.notAfter;
    entity.fingerprintSha256 = info.fingerprintSha256;
  } else {
    // did:web (Phase 2 — value is the did string; trust mode not meaningful, default 'ca').
    entity.value = args.value.trim();
    entity.trustMode = args.trustMode ?? 'ca';
  }

  const saved = await repo.save(entity);
  debug(`addTrustAnchor(type=${args.type}) succeeded - id=${saved.id}`);
  return toViewModel(saved);
};

export const removeTrustAnchor = async (id: string): Promise<string> => {
  debug(`removeTrustAnchor(${id})...`);
  const repo = await getRepo();
  await repo.delete({id});
  return id;
};

export const getX5cAnchorPems = async (): Promise<{ca: Array<string>; blind: Array<string>}> => {
  const repo = await getRepo();
  const rows = await repo.find({where: {type: 'x5c'}});
  return {
    ca: rows.filter(r => r.trustMode === 'ca').map(r => r.value),
    blind: rows.filter(r => r.trustMode === 'blind').map(r => r.value),
  };
};
