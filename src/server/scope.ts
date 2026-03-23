import { type DB, type TX, type DB_Promise } from "@/db/types";

/**
 * Scope holds a database client (either the root PrismaClient or a
 * transaction client) and provides transaction management.
 *
 * Data objects receive a Scope instead of a raw DB client. This gives us:
 *
 * 1. **Transaction ergonomics** - call `scope.transaction(async (tx) => { ... })`
 *    and all data objects created from `tx` share the same transaction client.
 *
 * 2. **Nestable transactions** - if a data object method calls
 *    `this.scope.transaction(...)` and the scope is already inside a
 *    transaction, it just runs the callback directly
 *
 * 3. **Testability** - in tests, we can create a Scope with a test database
 *    client, wrap each test in a transaction that rolls back, etc.
 *
 */
export class Scope {
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
   * If the scope is already inside a transaction, the callback runs
   * directly against the existing transaction client.
   *
   * The callback receives a new Scope bound to the transaction client.
   * Any data objects created from that scope will use the transaction
   * client automatically.
   *
   * @example
   * ```ts
   * await scope.transaction(async (tx) => {
   *   // tx.db is the transaction client
   *   await tx.db.project.create({ ... });
   *   await tx.db.flag.deleteMany({ ... });
   *   // all queries run in the same transaction
   * });
   * ```
   */
  async transaction<T>(fn: (scope: Scope) => Promise<T>): Promise<T> {
    if (this._inTransaction) {
      // Already in a transaction - run directly, no nesting
      return fn(this);
    }

    // Start a new interactive transaction
    return (this._db as DB).$transaction(async (tx) => {
      return fn(new Scope(tx, true));
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
  protected sc: Scope;

  constructor(scope: Scope) {
    this.sc = scope;
  }

  /** Shorthand for accessing the database client. */
  protected get db(): DB | TX {
    return this.sc.db;
  }
}
