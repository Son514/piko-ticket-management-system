#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2523237cd5c8b7bf117a11e835cb5472c347a91a11bf861a1956c6b56e8de435/contract';
import startContract from '../../snapshots/2523237cd5c8b7bf117a11e835cb5472c347a91a11bf861a1956c6b56e8de435/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/aa0cbbe2faa6bb7a67ca3961092de9f934f1deb117c419a29845644a23342a09/contract';
import endContract from '../../snapshots/aa0cbbe2faa6bb7a67ca3961092de9f934f1deb117c419a29845644a23342a09/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Attachment',
        column: col('storageKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dropNotNull({ schema: 'public', table: 'Attachment', column: 'data' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
