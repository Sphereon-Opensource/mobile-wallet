import {Column, CreateDateColumn, Entity, Index, PrimaryColumn} from 'typeorm';
import type {TrustAnchorType} from './TrustAnchorEntity';

/**
 * A link recorded when a credential/presentation from a contact verifies and its trust chain
 * (x5c) or identifier (did:web) resolves to a stored {@link TrustAnchorEntity}.
 *
 * Both sides are LOOSE string references on purpose: `trustAnchorId` is not a hard FK (so deleting
 * a trust anchor can never be blocked by the database) and `contactId` references a Party in the
 * separate contact data store (a different set of tables). Orphan rows are cleaned up explicitly
 * by the services on anchor/contact deletion and filtered at display time.
 */
@Entity('TrustAnchorContactLink')
@Index(['trustAnchorId', 'contactId'], {unique: true})
export class TrustAnchorContactLinkEntity {
  @PrimaryColumn({type: 'varchar'})
  id!: string;

  @Column({type: 'varchar'})
  trustAnchorId!: string;

  @Column({type: 'varchar'})
  contactId!: string; // Party id (loose reference to the contact store)

  @Column({type: 'varchar'})
  matchedType!: TrustAnchorType; // 'x5c' | 'did:web'

  @Column({type: 'text', nullable: true})
  matchedValue?: string; // cert subject DN (+ fingerprint) for x5c, or the did string for did:web

  @CreateDateColumn({type: 'datetime'})
  createdAt!: Date;
}
