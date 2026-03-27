import { type DB, type TX, type DB_Promise } from "@/db/types";

/**
 * DataAccessScope holds a database client (either the root PrismaClient or a
 * transaction client) and provides transaction management.
 *
 * Data objects receive a DataAccessScope instead of a raw DB client. This gives us:
 *
 * 1. **Transaction ergonomics** - call `scope.transaction(async (tx) => { ... })`
 *    and all data objects created from `tx` share the same transaction client.
 *
 * 2. **Nestable transactions** - if a data object method calls
 *    `this.scope.transaction(...)` and the scope is already inside a
 *    transaction, it just runs the callback directly
 *
 * 3. **Testability** - in tests, we can create a DataAccessScope with a test database
 *    client, wrap each test in a transaction that rolls back, etc.
 *
 */
export class DataAccessScope {
  private _db: DB | TX;
  private _inTransaction: boolean;

  constructor(db: DB | TX, inTransaction = false) {
    this._db = db;
    this._inTransaction = inTransaction;
  }

  /** The current database client (either root or transaction-scoped). */
  get db(): DB | TX {
    return this._db;
  }

  /** Whether this scope is already inside a transaction. */
  get inTransaction(): boolean {
    return this._inTransaction;
  }

  /**
   * Run a callback inside a database transaction.
   *
   * Mutates this scope's db client to the transaction client for the
   * duration of the callback. All data objects sharing this scope
   * automatically participate in the transaction.
   *
   * If already in a transaction, runs the callback directly.
   *
   * @example
   * ```ts
   * await sc.transaction(async () => {
   *   await project.update({ ... });
   *   await project.linkFlags(flagIds);
   * });
   * ```
   */
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    if (this._inTransaction) {
      return fn();
    }

    const originalDb = this._db;
    return (this._db as DB).$transaction(async (tx) => {
      this._db = tx;
      this._inTransaction = true;
      const result = await fn();
      this._db = originalDb;
      this._inTransaction = false;
      return result;
    });
  }

  /**
   * Run an array of queries as a batch transaction.
   *
   * If already inside an interactive transaction, the queries are simply
   * awaited (they're already atomic). Otherwise, delegates to Prisma's
   * batch `$transaction([...])`.
   *
   * @example
   * ```ts
   * await scope.batch([
   *   scope.db.user.create({ data: { ... } }),
   *   scope.db.post.update({ where: { ... }, data: { ... } }),
   * ]);
   * ```
   */
  async batch(queries: DB_Promise<unknown>[]): Promise<unknown[]> {
    if (this._inTransaction) {
      // Already atomic - just run them
      return Promise.all(queries);
    }

    return (this._db as DB).$transaction(queries);
  }
}

/**
 * Updated base class for data objects.
 *
 * This would replace the original `DataObject` which takes a raw DB client.
 * Data objects now access the database via `this.scope.db` and can
 * participate in transactions via `this.scope.transaction(...)`.
 *
 * When a data object creates other data objects internally, it passes
 * `this.scope` - so they all share the same database client
 * (and the same transaction, if one is active).
 */
export abstract class ScopedDataObject {
  protected sc: DataAccessScope;

  constructor(sc: DataAccessScope) {
    this.sc = sc;
  }

  /** Shorthand for accessing the database client. */
  protected get db(): DB | TX {
    return this.sc.db;
  }
}
