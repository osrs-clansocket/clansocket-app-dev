export interface UserTableColumn {
    table: string;
    column: string;
    excludeColumns?: string[];
    browseOrder?: string[];
}

export interface ScopedUserTable {
    table: string;
    column: string;
    action: "delete" | "null";
    excludeColumns?: readonly string[];
}

export interface ChildTable {
    table: string;
    parentTable: string;
    parentColumn: string;
    parentKey: string;
}

export interface AssetExtractor {
    table: string;
    blobColumn: string;
    idColumn: string;
    extColumn: string | null;
    defaultExt: string;
}
