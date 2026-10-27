#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/74ee42746da6fb19064069a3b022ac249865e687ea456c85e4fc0c9e1156c719/contract';
import endContract from '../../snapshots/74ee42746da6fb19064069a3b022ac249865e687ea456c85e4fc0c9e1156c719/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/aa0cbbe2faa6bb7a67ca3961092de9f934f1deb117c419a29845644a23342a09/contract';
import startContract from '../../snapshots/aa0cbbe2faa6bb7a67ca3961092de9f934f1deb117c419a29845644a23342a09/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
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
        table: 'Comment',
        columns: [
          col('authorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('editedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ticketId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('visibility', 'text', {
            notNull: true,
            default: lit('public'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Comment_visibility_check_4dc990d4',
            sql`"visibility" IN ('public', 'internal')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Comment',
        index: 'Comment_authorId_idx_e47547ed',
        columns: ['authorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Comment',
        index: 'Comment_ticketId_createdAt_idx_bc482a25',
        columns: ['ticketId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Comment',
        index: 'Comment_ticketId_idx_2fe526c3',
        columns: ['ticketId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comment',
        foreignKey: {
          name: 'Comment_ticketId_fkey',
          columns: ['ticketId'],
          references: { schema: 'public', table: 'Post', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Comment',
        foreignKey: {
          name: 'Comment_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
