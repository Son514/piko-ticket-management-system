#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/455f6306e76be75e49a54066de3e45bfed8541a694c9ad86ec83f0a6fa4174c7/contract';
import endContract from '../../snapshots/455f6306e76be75e49a54066de3e45bfed8541a694c9ad86ec83f0a6fa4174c7/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/653e54b4b85d6e59cb077236add11c0959efd1aea52bb2c75ceb2d5fa1e871a1/contract';
import startContract from '../../snapshots/653e54b4b85d6e59cb077236add11c0959efd1aea52bb2c75ceb2d5fa1e871a1/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Attachment',
        columns: [
          col('contentType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('data', 'bytea', { notNull: true, codecRef: { codecId: 'pg/bytea@1' } }),
          col('filename', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('size', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ticketId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('category', 'text', {
          notNull: true,
          default: lit('general'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'Post',
        column: col('priority', 'text', {
          notNull: true,
          default: lit('medium'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Post',
        constraint: 'Post_category_check_1c345205',
        expression: sql`"category" IN ('general', 'account', 'billing', 'technical', 'feature')`,
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'Post',
        constraint: 'Post_priority_check_4fb75310',
        expression: sql`"priority" IN ('low', 'medium', 'high', 'urgent')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'Attachment',
        index: 'Attachment_ticketId_idx_2fe526c3',
        columns: ['ticketId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Attachment',
        foreignKey: {
          name: 'Attachment_ticketId_fkey',
          columns: ['ticketId'],
          references: { schema: 'public', table: 'Post', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
