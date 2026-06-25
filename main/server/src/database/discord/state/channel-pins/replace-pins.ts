import { withGuildTx } from "../../discord.js";
import type { ChannelPinRow } from "../types.js";
import { upsertChannelPin } from "./upsert-channel-pin.js";

const DELETE_BY_CHANNEL_SQL = `DELETE FROM discord_channel_pins WHERE channel_id = ?`;

export function replacePinsChannel(
    clanId: string,
    guildId: string,
    channelId: string,
    rows: readonly ChannelPinRow[],
): void {
    withGuildTx(clanId, guildId, (db) => {
        db.prepare(DELETE_BY_CHANNEL_SQL).run(channelId);
        for (const row of rows) upsertChannelPin(clanId, guildId, row);
    });
}
