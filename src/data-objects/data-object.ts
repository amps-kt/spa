import { type DB } from "@/db/types";

/**
 * @deprecated use ScopedDataObject instead
 */
export abstract class DataObject {
  protected db: DB;

  constructor(db: DB) {
    this.db = db;
  }
}
