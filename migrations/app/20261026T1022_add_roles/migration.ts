#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/653e54b4b85d6e59cb077236add11c0959efd1aea52bb2c75ceb2d5fa1e871a1/contract';
import endContract from '../../snapshots/653e54b4b85d6e59cb077236add11c0959efd1aea52bb2c75ceb2d5fa1e871a1/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/ba91225dcc22201aecd9dd196634ca066ce6bef2c4f242ecd6316429585efeee/contract';
import startContract from '../../snapshots/ba91225dcc22201aecd9dd196634ca066ce6bef2c4f242ecd6316429585efeee/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('deactivatedAt', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('isActive', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('role', 'text', {
          notNull: true,
          default: lit('customer'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'User',
        constraint: 'User_role_check_7e859979',
        expression: sql`"role" IN ('customer', 'agent', 'admin')`,
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_isActive_idx_77fe3ba1',
        columns: ['isActive'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_role_idx_2c1ddf83',
        columns: ['role'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
