import type { CacheInfo, NewsItem } from "@shared/types"
import type { Database } from "db0"

export class Cache {
  private db
  constructor(db: Database) {
    this.db = db
  }

  async init() {
    await this.db.prepare(`
      CREATE TABLE IF NOT EXISTS cache (
        id TEXT PRIMARY KEY,
        updated INTEGER,
        data TEXT
      );
    `).run()
    logger.success(`init cache table`)
  }

  async set(key: string, value: NewsItem[]) {
    const now = Date.now()
    await this.db.prepare(
      `INSERT OR REPLACE INTO cache (id, data, updated) VALUES (?, ?, ?)`,
    ).run(key, JSON.stringify(value), now)
    logger.success(`set ${key} cache`)
  }

  async get(key: string): Promise<CacheInfo> {
    const row: any = await this.db.prepare(`SELECT id, data, updated FROM cache WHERE id = ?`).get(key)
    const r = row
      ? {
          ...row,
          data: JSON.parse(row.data),
        }
      : undefined
    logger.success(`get ${key} cache`)
    return r
  }

  async delete(key: string) {
    return await this.db.prepare(`DELETE FROM cache WHERE id = ?`).run(key)
  }
}
