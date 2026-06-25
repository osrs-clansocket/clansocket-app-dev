import type Database from "better-sqlite3";

const _connections = new Map<string, Database.Database>();

export function getCachedConnection(key: string): Database.Database | undefined {
    return _connections.get(key);
}

export function setCachedConnection(key: string, db: Database.Database): void {
    _connections.set(key, db);
}

export function deleteCachedConnection(key: string): void {
    _connections.delete(key);
}

export function eachCachedConnection(fn: (db: Database.Database, key: string) => void): void {
    for (const [key, db] of _connections) fn(db, key);
}

export function cachedConnectionCount(): number {
    return _connections.size;
}

export function clearCachedConnections(): void {
    _connections.clear();
}
