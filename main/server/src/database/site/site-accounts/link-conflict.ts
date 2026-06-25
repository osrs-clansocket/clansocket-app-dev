export class LinkConflict extends Error {
    constructor(public readonly conflict: "provider_already_linked_elsewhere" | "account_already_has_provider") {
        super(conflict);
    }
}
