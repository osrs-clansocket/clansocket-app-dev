import { registerEntityAttribute } from "../../../flows/registries/entity-attribute-registry.js";

registerEntityAttribute({
    path: "entity.rsn",
    label: "RSN",
    type: "rsn",
    valueSourceRef: "rsn",
    sqlTable: "clan_members",
    sqlColumn: "member_name",
});

registerEntityAttribute({
    path: "entity.account.type",
    label: "Account type",
    type: "string",
    sqlTable: "clan_accounts",
    sqlColumn: "account_type",
});

registerEntityAttribute({
    path: "entity.clan.rank",
    label: "Clan rank",
    type: "clan-rank",
    valueSourceRef: "clan-rank",
    sqlTable: "clan_members",
    sqlColumn: "rank",
});

registerEntityAttribute({
    path: "entity.clan.joined_at",
    label: "Clan join date",
    type: "timestamp",
    sqlTable: "clan_members",
    sqlColumn: "joined_at",
});
