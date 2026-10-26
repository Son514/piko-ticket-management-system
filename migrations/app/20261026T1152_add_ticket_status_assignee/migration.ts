#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2523237cd5c8b7bf117a11e835cb5472c347a91a11bf861a1956c6b56e8de435/contract';
import endContract from '../../snapshots/2523237cd5c8b7bf117a11e835cb5472c347a91a11bf861a1956c6b56e8de435/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/455f6306e76be75e49a54066de3e45bfed8541a694c9ad86ec83f0a6fa4174c7/contract';
import startContract from '../../snapshots/455f6306e76be75e49a54066de3e45bfed8541a694c9ad86ec83f0a6fa4174c7/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('assigneeId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('status', 'text', {
          notNull: true,
          default: lit('open'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Post',
        constraint: 'Post_status_check_133bb1f4',
        expression: sql`"status" IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_assigneeId_idx_fd12ae38',
        columns: ['assigneeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Post',
        index: 'Post_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_assigneeId_fkey',
          columns: ['assigneeId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
