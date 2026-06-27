# Flow Engine — EXCLUDED Operations Roster

Every operation considered for the flow engine capability surface, then rejected, with the reason. Inheriting rounds read this before re-evaluating; promotion to LIVE or MANUAL requires evidence that the rejection rationale no longer applies.

Three rejection classes:
- **admin-only**: operator console action; not member-facing automation.
- **credential**: handles secrets, tokens, or auth state.
- **recursive**: flows-of-flows or automation-of-automation; risks infinite loops or self-modification.
- **infrastructure**: platform configuration; out of clan-author scope.

| capability | op_id | handler_ref | rejection_reason |
|------------|-------|-------------|------------------|
| discord | discord:byo-bot.bind | server/src/discord/routes/byo-bot/bind.ts | admin-only (bot identity binding) |
| discord | discord:byo-bot.link | server/src/discord/routes/byo-bot/link.ts | admin-only |
| discord | discord:byo-bot.link-persist | server/src/discord/routes/byo-bot/link-persist.ts | admin-only |
| discord | discord:byo-bot.reassign-linker | server/src/discord/routes/byo-bot/reassign-linker.ts | admin-only |
| discord | discord:byo-bot.revoke | server/src/discord/routes/byo-bot/revoke.ts | admin-only |
| discord | discord:byo-bot.unbind | server/src/discord/routes/byo-bot/unbind.ts | admin-only |
| discord | discord:byo-bot.verify | server/src/discord/routes/byo-bot/verify.ts | admin-only |
| discord | discord:webhook-tokens.bind | server/src/discord/routes/webhook-tokens/bind.ts | credential |
| discord | discord:webhook-tokens.revoke | server/src/discord/routes/webhook-tokens/revoke.ts | credential |
| discord | discord:interactions.cleanup | server/src/discord/routes/interactions/cleanup.ts | admin-only |
| discord | discord:interactions.upsert | server/src/discord/routes/interactions/upsert.ts | admin-only |
| discord | discord:outbound.transition | server/src/discord/routes/outbound/transition.ts | infrastructure (queue worker state machine) |
| discord | discord:auto-hooks.create | server/src/discord/routes/auto-hooks/create.ts | recursive (automation-of-automation) |
| discord | discord:auto-hooks.update | server/src/discord/routes/auto-hooks/update.ts | recursive |
| discord | discord:auto-hooks.delete | server/src/discord/routes/auto-hooks/delete.ts | recursive |
| discord | discord:auto-hooks.toggle | server/src/discord/routes/auto-hooks/toggle.ts | recursive |
| discord | discord:auto-hooks.test-send | server/src/discord/routes/auto-hooks/test-send.ts | recursive |
| discord | discord:channels.delete-permissions | server/src/discord/routes/channel-overwrites/delete-permissions.ts | rights revoke (member-impacting permission change) |
| discord | discord:roles.set-permissions | server/src/discord/routes/roles/set-permissions.ts | rights bump (admin-only) |
| discord | discord:policy.* | server/src/discord/routes/policy/** | admin-only (governance) |
| discord | clans/remove-server | server/src/clans/routes/remove-server.ts | admin-only (clan-discord unlink) |
| wom | wom:link | server/src/wom/routes/link.ts | credential (group binding) |
| wom | wom:revoke | server/src/wom/routes/revoke.ts | admin-only |
| wom | wom:reassign-linker | server/src/wom/routes/reassign-linker.ts | admin-only |
| wom | wom:sync-now | server/src/wom/routes/sync-now.ts | admin-only (manual backfill) |
| wom | wom:update-now | server/src/wom/routes/update-now.ts | admin-only |
| wom | wom:verify-credentials | server/src/wom/dispatcher/sdk-handlers.ts (verify-credentials case) | credential |
| clans | clans:branding.customize | server/src/clans/routes/branding/customize.ts | admin-only |
| clans | clans:branding.update | server/src/clans/routes/branding/update.ts | admin-only |
| clans | clans:branding.upload | server/src/clans/routes/branding/upload.ts | admin-only (file ingestion) |
| clans | clans:homepage.save | server/src/clans/routes/homepage/save.ts | admin-only (page edit) |
| clans | clans:homepage.upload-image | server/src/clans/routes/homepage/upload-image.ts | admin-only |
| clans | clans:homepage.delete-image | server/src/clans/routes/homepage/delete-image.ts | admin-only |
| clans | clans:managers.* | server/src/clans/routes/managers.ts | admin-only |
| clans | clans:apply-manager-approval | server/src/clans/routes/apply-manager-approval.ts | admin-only |
| clans | clans:manager-requests.* | server/src/clans/routes/manager-requests.ts | admin-only |
| clans | clans:ownership-transfer | server/src/clans/routes/ownership-transfer.ts | admin-only (clan ownership change) |
| clans | clans:positions.* | server/src/clans/routes/positions.ts | admin-only (rank hierarchy) |
| clans | clans:whitelist.* | server/src/clans/routes/whitelist.ts | admin-only |
| clans | clans:plugin-config.global-set | server/src/clans/manage-routes/plugin-config-routes.ts | infrastructure (plugin global preset) |
| clans | clans:plugin-config.member-override | server/src/clans/manage-routes/plugin-config-routes.ts | infrastructure (per-member plugin override) |
| clans | clans:audit-write | server/src/clans/manage-routes/audit-write.ts | infrastructure (audit log direct write) |
| clans | clans:seo.patch | server/src/clans/manage-routes/seo-routes.ts | infrastructure (SEO metadata) |
| clan-vault | clan-vault.read | server/src/clan-vault/operations/read-entry.ts | credential |
| clan-vault | clan-vault.write | server/src/clan-vault/operations/write-entry.ts | credential |
| clan-vault | clan-vault.delete | server/src/clan-vault/operations/delete-entry.ts | credential |
| clan-vault | clan-vault.list | server/src/clan-vault/operations/list-entry-keys.ts | credential |
