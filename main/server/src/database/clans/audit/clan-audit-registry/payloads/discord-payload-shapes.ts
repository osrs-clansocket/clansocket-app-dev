import type { AuditCommonPayload, BeforeAfter } from "../payload-types.js";

export type * from "./discord-guild-shapes.js";
export type * from "./discord-hook-shapes.js";

export interface DiscordBase extends AuditCommonPayload {
    guildId: string;
    targetName: string;
}

export interface DiscordChannelState {
    name: string;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
    parentId?: string | null;
}

export interface ChannelsCreate extends DiscordBase {
    channelType: number;
    parentId?: string | null;
    topic?: string | null;
    nsfw?: boolean;
    rateLimitPerUser?: number;
}
export interface ChannelsUpdate extends DiscordBase, BeforeAfter<DiscordChannelState> {}
export interface ChannelsDelete extends DiscordBase {
    channelType: number;
}
export interface ChannelsMove extends DiscordBase {
    beforePosition: number;
    afterPosition: number;
    beforeParentId?: string | null;
    afterParentId?: string | null;
}
export interface ChannelsSetPerms extends DiscordBase {
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
    allow: string;
    deny: string;
}
export interface ChannelsDeletePerms extends DiscordBase {
    overwriteKind: "role" | "member";
    overwriteTargetId: string;
    overwriteTargetName: string;
}

export interface DiscordRoleState {
    name: string;
    color: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions: string;
}
export interface RolesCreate extends DiscordBase {
    color: number;
    hoist?: boolean;
    mentionable?: boolean;
    permissions: string;
}
export interface RolesUpdate extends DiscordBase, BeforeAfter<DiscordRoleState> {}
export type RolesDelete = DiscordBase;
export interface RolesPosition extends DiscordBase {
    beforePosition: number;
    afterPosition: number;
}
export interface RolesPerms extends DiscordBase {
    beforePermissions: string;
    afterPermissions: string;
}

export interface MembersBase extends AuditCommonPayload {
    guildId: string;
    userId: string;
    userName: string;
}
export interface MembersNickname extends MembersBase {
    beforeNickname: string | null;
    afterNickname: string | null;
}
export interface MembersAddRole extends MembersBase {
    roleId: string;
    roleName: string;
}
export interface MembersRemoveRole extends MembersBase {
    roleId: string;
    roleName: string;
}
export interface MembersTimeout extends MembersBase {
    beforeCommunicationDisabledUntil: number | null;
    afterCommunicationDisabledUntil: number | null;
    reason?: string;
}
export interface MembersKick extends MembersBase {
    reason?: string;
}
export interface MembersBan extends MembersBase {
    reason?: string;
    deleteMessageDays?: number;
}
export interface MembersUnban extends MembersBase {
    reason?: string;
}

export interface DiscordWebhookState {
    name: string | null;
    channelId: string;
    avatarUrl?: string | null;
}
export interface WebhooksCreate extends DiscordBase {
    channelId: string;
    webhookType: number;
}
export interface WebhooksUpdate extends DiscordBase, BeforeAfter<DiscordWebhookState> {}
export interface WebhooksDelete extends DiscordBase {
    channelId: string;
}
export interface WebhooksRegenToken extends DiscordBase {
    channelId: string;
}
export interface WebhookTokenRevoked extends AuditCommonPayload {
    guildId: string;
    targetName: string;
    webhookId: string;
}

export interface EmojisCreate extends DiscordBase {
    animated: boolean;
}
export interface EmojisRename extends DiscordBase {
    beforeName: string;
    afterName: string;
}
export type EmojisDelete = DiscordBase;
export interface StickersCreate extends DiscordBase {
    formatType: number;
    description?: string | null;
    tags?: string | null;
}
export interface StickersRename extends DiscordBase {
    beforeName: string;
    afterName: string;
}
export type StickersDelete = DiscordBase;
