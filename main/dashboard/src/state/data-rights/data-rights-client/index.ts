import { browse, deleteRange, deleteRow, listScopes } from "./browse.js";
import { deleteSelfData, exportClanData, exportSelfData, getDataStats } from "./export.js";
import { openWritesStream } from "./streams/writes-stream.js";

export type {
    BrowseResponse,
    DataRightsError,
    DeleteResponse,
    Scope,
    ScopeKind,
    ScopeListItem,
    ScopeListTable,
    UserDataStats,
    WritesStreamEvent,
    WritesStreamKind,
} from "./types.js";

export const dataRightsClient = {
    listScopes,
    browse,
    deleteRow,
    deleteRange,
    openWritesStream,
    getDataStats,
    exportSelfData,
    deleteSelfData,
    exportClanData,
};
