import {Column, CreateDateColumn, Entity, PrimaryColumn} from 'typeorm';

export type TrustAnchorType = 'x5c' | 'did:web';
export type TrustAnchorMode = 'ca' | 'blind';
export type TrustAnchorSource = 'paste' | 'file' | 'qr' | 'url';

@Entity('TrustAnchor')
export class TrustAnchorEntity {
  @PrimaryColumn({type: 'varchar'})
  id!: string;

  @Column({type: 'varchar'})
  type!: TrustAnchorType;

  @Column({type: 'varchar'})
  label!: string;

  @Column({type: 'text'})
  value!: string; // PEM for x5c, did string for did:web

  @Column({type: 'varchar'})
  trustMode!: TrustAnchorMode;

  @Column({type: 'varchar', nullable: true})
  subjectDN?: string;

  @Column({type: 'varchar', nullable: true})
  issuerDN?: string;

  @Column({type: 'datetime', nullable: true})
  notBefore?: Date;

  @Column({type: 'datetime', nullable: true})
  notAfter?: Date;

  @Column({type: 'varchar', nullable: true})
  fingerprintSha256?: string;

  @Column({type: 'varchar'})
  source!: TrustAnchorSource;

  @CreateDateColumn({type: 'datetime'})
  createdAt!: Date;
}
