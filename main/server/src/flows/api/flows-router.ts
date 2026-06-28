import express from "express";
import { registerApi } from "../../api-registry.js";
import { clanFlowsDb } from "../../database/index.js";
import { capabilityRegistry } from "../registries/capability-registry.js";
import { parseFlowDefinition } from "../store/parsers/flow-parser.js";
import { runAllValidators } from "../validators/validator-registry.js";
import { runDryRun } from "../engine/dry-run/dry-run-executor.js";
import { walkScopeFor } from "../../filter/walkers/scope-walker.js";
import { templateRegistry } from "../templates/template-registry.js";
import { listPendingReviews, approveReview, cancelReview } from "../review/review-queue-store.js";
import { resolveValueOptions, type ValueOptionsScope } from "../value-resolvers/entity-value-options.js";
import { entityAttributes } from "../registries/entity-attribute-schema.js";
import { FILTER_OPERATORS } from "../../filter/dsl-types.js";
import { componentRegistry } from "../engine/components/component-registry.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { recordClanAudit } from "../../database/index.js";
import { validateFlowReferences } from "../validators/reference-validator.js";
import { resolveValueSource, valueSourceRegistry } from "../registries/value-source-registry.js";
import { allRegisteredFieldTypes, operatorsForFieldType } from "../registries/field-operator-registry.js";
import { nextFireAt } from "../engine/dispatchers/cron-evaluator.js";
import { dispatchEventSafe } from "../engine/dispatchers/event-router.js";
import { byGuildId } from "../../database/discord/servers/by-guild-id.js";
import { authenticate } from "../../api/middleware.js";
import "../_bootstrap.js";

const SCHEDULE_UPSERT_SQL = `INSERT INTO clan_flow_schedules (
    flow_id, flow_name, enabled, cron_expression, timezone, next_fire_at
) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (flow_id) DO UPDATE SET
        flow_name = excluded.flow_name,
        cron_expression = excluded.cron_expression,
        timezone = excluded.timezone,
        next_fire_at = excluded.next_fire_at`;

const LOOP_UPSERT_SQL = `INSERT INTO clan_flow_loops (
    flow_id, flow_name, enabled, interval_value, interval_unit, next_fire_at, on_overlap
) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (flow_id) DO UPDATE SET
        flow_name = excluded.flow_name,
        interval_value = excluded.interval_value,
        interval_unit = excluded.interval_unit,
        on_overlap = excluded.on_overlap,
        next_fire_at = excluded.next_fire_at`;

const LOOP_UNIT_MS: Readonly<Record<string, number>> = {
    minutes: 60_000,
    hours: 3_600_000,
    days: 86_400_000,
    weeks: 7 * 86_400_000,
};

interface ScheduleConfig {
    cron_expression?: string;
    timezone?: string;
}

interface LoopConfig {
    interval_value?: number;
    interval_unit?: string;
    on_overlap?: string;
}

function upsertScheduleRow(
    clanId: string,
    flowId: string,
    flowName: string,
    enabled: number,
    cfg: ScheduleConfig,
): void {
    const cron = typeof cfg.cron_expression === "string" ? cfg.cron_expression : "";
    if (cron.length === 0) return;
    const tz = typeof cfg.timezone === "string" && cfg.timezone.length > 0 ? cfg.timezone : "UTC";
    const now = Date.now();
    let nextAt = now + 60_000;
    try {
        nextAt = nextFireAt(cron, now, tz);
    } catch {
        return;
    }
    clanFlowsDb(clanId).prepare(SCHEDULE_UPSERT_SQL).run(flowId, flowName, enabled, cron, tz, nextAt);
}

function upsertLoopRow(clanId: string, flowId: string, flowName: string, enabled: number, cfg: LoopConfig): void {
    const value = typeof cfg.interval_value === "number" ? cfg.interval_value : 0;
    const unit = typeof cfg.interval_unit === "string" ? cfg.interval_unit : "minutes";
    if (value <= 0) return;
    const unitMs = LOOP_UNIT_MS[unit] ?? LOOP_UNIT_MS.minutes!;
    const onOverlap = typeof cfg.on_overlap === "string" ? cfg.on_overlap : "skip";
    clanFlowsDb(clanId)
        .prepare(LOOP_UPSERT_SQL)
        .run(flowId, flowName, enabled, value, unit, Date.now() + value * unitMs, onOverlap);
}

function requireFlowManager(req: express.Request, res: express.Response, clanId: string): string | null {
    const siteAccountId = req.siteAccountId;
    if (!siteAccountId) {
        res.status(403).json({ error: "authentication required" });
        return null;
    }
    if (!isClanManager(siteAccountId, clanId)) {
        res.status(403).json({ error: "manager access required" });
        return null;
    }
    return siteAccountId;
}

function auditFlowAction(
    clanId: string,
    siteAccountId: string,
    action: string,
    flowId: string,
    extra: Readonly<Record<string, unknown>> = {},
): void {
    try {
        recordClanAudit(clanId, {
            actor: siteAccountId,
            action: action as never,
            targetId: flowId,
            payload: { flowId, ...extra } as never,
        });
    } catch {
    }
}

const router = express.Router();

router.get("/templates", (_req, res) => {
    const out = templateRegistry.list().map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        group: t.group,
    }));
    res.json({ templates: out });
});

router.get("/templates/:id", (req, res) => {
    const template = templateRegistry.get(req.params.id);
    if (!template) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.json({
        template: {
            id: template.id,
            name: template.name,
            description: template.description,
            definition: template.build(),
        },
    });
});

router.get("/capabilities", (_req, res) => {
    const out = capabilityRegistry.list().map((m) => ({
        name: m.name,
        version: m.version,
        capability_color: m.capability_color,
        operations: Object.fromEntries(
            Object.entries(m.operations).map(([opId, spec]) => [
                opId,
                {
                    safety_tier: spec.safety_tier,
                    input_schema: spec.input_schema,
                    output_schema: spec.output_schema,
                    result_classes: spec.result_classes,
                    side_effects: spec.side_effects,
                },
            ]),
        ),
        triggers: Object.fromEntries(
            Object.entries(m.triggers).map(([trgId, spec]) => [
                trgId,
                {
                    event_source: spec.event_source,
                    payload_schema: spec.payload_schema,
                    triggerable: spec.triggerable,
                },
            ]),
        ),
    }));
    res.json({ capabilities: out });
});

router.post("/validate", (req, res) => {
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const findings = runAllValidators({ definition });
        res.json({ findings });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.get("/operators", (_req, res) => {
    res.json({ operators: FILTER_OPERATORS });
});

router.get("/component-kinds", (_req, res) => {
    const kinds = componentRegistry.list().map((c) => ({
        kind: c.kind,
        label: c.label,
        color: c.color,
        reads_event: c.reads_event,
        reads_live_entity: c.reads_live_entity,
        yields_execution: c.yields_execution,
        default_output_handles: c.default_output_handles,
    }));
    res.json({ kinds });
});

router.get("/field-operators", (_req, res) => {
    const out: Record<string, readonly string[]> = {};
    for (const type of allRegisteredFieldTypes()) out[type] = operatorsForFieldType(type);
    res.json({ field_operators: out });
});

router.get("/entity-attributes", (_req, res) => {
    const attrs = entityAttributes().map((a) => ({ path: a.path, label: a.label, type: a.type }));
    res.json({ attributes: attrs });
});

router.get("/value-sources", async (req, res) => {
    const format = String(req.query.format ?? "");
    const clanId = String(req.query.clan_id ?? "");
    if (format.length === 0) {
        res.status(400).json({ error: "format required" });
        return;
    }
    const spec = valueSourceRegistry.get(format);
    if (!spec) {
        res.status(404).json({ error: `unknown value source format: ${format}` });
        return;
    }
    if (spec.fetch) {
        if (clanId.length === 0) {
            res.status(400).json({ error: "clan_id required for dynamic value source" });
            return;
        }
        const siteAccountId = req.siteAccountId;
        if (!siteAccountId) {
            res.status(403).json({ error: "authentication required" });
            return;
        }
        if (!isClanManager(siteAccountId, clanId)) {
            res.status(403).json({ error: "manager access required" });
            return;
        }
    }
    try {
        const items = await resolveValueSource(format, clanId);
        res.json({ format, label: spec.label, items });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get("/value-options", (req, res) => {
    const scope = String(req.query.scope ?? "") as ValueOptionsScope;
    const field = String(req.query.field ?? "");
    const clanId = String(req.query.clan_id ?? "");
    const triggerType = req.query.trigger_type ? String(req.query.trigger_type) : null;
    if (scope !== "trigger" && scope !== "entity" && scope !== "event") {
        res.status(400).json({ error: "scope must be trigger|entity|event" });
        return;
    }
    if (!field || !clanId) {
        res.status(400).json({ error: "field and clan_id required" });
        return;
    }
    const siteAccountId = req.siteAccountId;
    if (!siteAccountId) {
        res.status(403).json({ error: "authentication required" });
        return;
    }
    if (!isClanManager(siteAccountId, clanId)) {
        res.status(403).json({ error: "manager access required" });
        return;
    }
    void (async () => {
        try {
            const values = await resolveValueOptions(scope, clanId, field, triggerType);
            res.json({ values });
        } catch (err) {
            res.status(400).json({ error: (err as Error).message });
        }
    })();
});

router.post("/discord-trigger", authenticate, (req, res) => {
    const guildId = String(req.body?.guild_id ?? "");
    const triggerId = String(req.body?.trigger_id ?? "");
    const payload = (req.body?.payload ?? {}) as Readonly<Record<string, unknown>>;
    if (guildId.length === 0 || triggerId.length === 0) {
        res.status(400).json({ error: "guild_id and trigger_id required" });
        return;
    }
    const routing = byGuildId(guildId);
    if (!routing) {
        res.status(404).json({ error: "guild not linked to clan" });
        return;
    }
    dispatchEventSafe({
        clanId: routing.clan_id,
        triggerId,
        rsn: null,
        payload,
    });
    res.status(202).json({ ok: true });
});

router.post("/scope", (req, res) => {
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const nodeId = String(req.body?.node_id ?? "");
        const sources = walkScopeFor(definition, nodeId);
        res.json({ sources });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.post("/dry-run-direct", async (req, res) => {
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const trace = await runDryRun({
            clanId: String(req.body?.clan_id ?? "fixture"),
            flowId: "dry-run-direct",
            flowName: "Dry run",
            flowVersion: 0,
            executionId: 0,
            definition,
            event: req.body?.event ?? {},
            entity: req.body?.entity ?? {},
            variables: {},
            trackers: {},
            currentStep: definition.entry_node_id,
            wakeEventKind: null,
            wakeAt: null,
            wakeTimeoutAt: null,
        });
        res.json({ trace });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.get("/:clanId", (req, res) => {
    const db = clanFlowsDb(req.params.clanId);
    const rows = db
        .prepare(
            "SELECT flow_id, flow_name, enabled, archived, published_version, created_at, updated_at FROM clan_flows ORDER BY updated_at DESC",
        )
        .all();
    res.json({ flows: rows });
});

router.get("/:clanId/:flowId", (req, res) => {
    const db = clanFlowsDb(req.params.clanId);
    const row = db
        .prepare(
            "SELECT flow_id, flow_name, definition_json, enabled, archived, published_version, created_at, updated_at FROM clan_flows WHERE flow_id = ?",
        )
        .get(req.params.flowId) as Record<string, unknown> | undefined;
    if (!row) {
        res.status(404).json({ error: "not found" });
        return;
    }
    res.json({ flow: row });
});

router.post("/:clanId", (req, res) => {
    const siteAccountId = requireFlowManager(req, res, req.params.clanId);
    if (!siteAccountId) return;
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const refErrors = validateFlowReferences(definition);
        if (refErrors.length > 0) {
            res.status(400).json({ error: "unknown_refs", details: refErrors });
            return;
        }
        const flowId = String(req.body?.flow_id ?? "");
        const flowName = String(req.body?.flow_name ?? "");
        if (!flowId || !flowName) {
            res.status(400).json({ error: "flow_id and flow_name required" });
            return;
        }
        const now = 0;
        const db = clanFlowsDb(req.params.clanId);
        const existing = db.prepare("SELECT flow_id FROM clan_flows WHERE flow_id = ?").get(flowId);
        if (existing) {
            db.prepare(
                "UPDATE clan_flows SET flow_name = ?, definition_json = ?, updated_at = ? WHERE flow_id = ?",
            ).run(flowName, JSON.stringify(definition), now, flowId);
            auditFlowAction(req.params.clanId, siteAccountId, "server:flow.updated", flowId, { flowName });
        } else {
            db.prepare(
                "INSERT INTO clan_flows (flow_id, flow_name, definition_json, enabled, archived, created_at, updated_at) VALUES (?, ?, ?, 0, 0, ?, ?)",
            ).run(flowId, flowName, JSON.stringify(definition), now, now);
            auditFlowAction(req.params.clanId, siteAccountId, "server:flow.created", flowId, { flowName });
        }
        res.status(201).json({ flow_id: flowId });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.patch("/:clanId/:flowId", (req, res) => {
    const siteAccountId = requireFlowManager(req, res, req.params.clanId);
    if (!siteAccountId) return;
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const refErrors = validateFlowReferences(definition);
        if (refErrors.length > 0) {
            res.status(400).json({ error: "unknown_refs", details: refErrors });
            return;
        }
        const flowName = String(req.body?.flow_name ?? "");
        if (!flowName) {
            res.status(400).json({ error: "flow_name required" });
            return;
        }
        const now = 0;
        const db = clanFlowsDb(req.params.clanId);
        const result = db
            .prepare("UPDATE clan_flows SET flow_name = ?, definition_json = ?, updated_at = ? WHERE flow_id = ?")
            .run(flowName, JSON.stringify(definition), now, req.params.flowId);
        if (result.changes === 0) {
            res.status(404).json({ error: "not found" });
            return;
        }
        auditFlowAction(req.params.clanId, siteAccountId, "server:flow.updated", req.params.flowId, { flowName });
        res.json({ flow_id: req.params.flowId });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.post("/:clanId/:flowId/enable", (req, res) => {
    const siteAccountId = requireFlowManager(req, res, req.params.clanId);
    if (!siteAccountId) return;
    const enabled = req.body?.enabled === true ? 1 : 0;
    const db = clanFlowsDb(req.params.clanId);
    const result = db.prepare("UPDATE clan_flows SET enabled = ?, updated_at = ? WHERE flow_id = ?").run(
        enabled,
        0,
        req.params.flowId,
    );
    if (result.changes === 0) {
        res.status(404).json({ error: "not found" });
        return;
    }
    db.prepare("UPDATE clan_flow_schedules SET enabled = ? WHERE flow_id = ?").run(enabled, req.params.flowId);
    db.prepare("UPDATE clan_flow_loops SET enabled = ? WHERE flow_id = ?").run(enabled, req.params.flowId);
    auditFlowAction(
        req.params.clanId,
        siteAccountId,
        enabled === 1 ? "server:flow.enabled" : "server:flow.disabled",
        req.params.flowId,
    );
    res.json({ flow_id: req.params.flowId, enabled: enabled === 1 });
});

router.post("/:clanId/:flowId/publish", (req, res) => {
    const siteAccountId = requireFlowManager(req, res, req.params.clanId);
    if (!siteAccountId) return;
    try {
        const db = clanFlowsDb(req.params.clanId);
        const row = db
            .prepare("SELECT flow_id, flow_name, definition_json, published_version, enabled FROM clan_flows WHERE flow_id = ?")
            .get(req.params.flowId) as
            | { flow_id: string; flow_name: string; definition_json: string; published_version: number | null; enabled: number }
            | undefined;
        if (!row) {
            res.status(404).json({ error: "not found" });
            return;
        }
        const definition = parseFlowDefinition(JSON.parse(row.definition_json));
        const nextVersion = (row.published_version ?? 0) + 1;
        const now = 0;
        db.prepare(
            "INSERT INTO clan_flow_versions (flow_id, flow_name, version, definition_json, published_at) VALUES (?, ?, ?, ?, ?)",
        ).run(row.flow_id, row.flow_name, nextVersion, row.definition_json, now);
        db.prepare("UPDATE clan_flows SET published_version = ?, updated_at = ? WHERE flow_id = ?").run(
            nextVersion,
            now,
            row.flow_id,
        );
        const enabledForRow = row.enabled === 1 ? 1 : 0;
        if (definition.trigger_type === "schedule") {
            db.prepare("DELETE FROM clan_flow_loops WHERE flow_id = ?").run(row.flow_id);
            upsertScheduleRow(
                req.params.clanId,
                row.flow_id,
                row.flow_name,
                enabledForRow,
                definition.trigger_config as ScheduleConfig,
            );
        } else if (definition.trigger_type === "loop") {
            db.prepare("DELETE FROM clan_flow_schedules WHERE flow_id = ?").run(row.flow_id);
            upsertLoopRow(
                req.params.clanId,
                row.flow_id,
                row.flow_name,
                enabledForRow,
                definition.trigger_config as LoopConfig,
            );
        } else {
            db.prepare("DELETE FROM clan_flow_schedules WHERE flow_id = ?").run(row.flow_id);
            db.prepare("DELETE FROM clan_flow_loops WHERE flow_id = ?").run(row.flow_id);
        }
        auditFlowAction(req.params.clanId, siteAccountId, "server:flow.published", row.flow_id, {
            flowName: row.flow_name,
            version: nextVersion,
        });
        res.json({ flow_id: row.flow_id, version: nextVersion });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.delete("/:clanId/:flowId", (req, res) => {
    const siteAccountId = requireFlowManager(req, res, req.params.clanId);
    if (!siteAccountId) return;
    const db = clanFlowsDb(req.params.clanId);
    const result = db.prepare("UPDATE clan_flows SET archived = 1 WHERE flow_id = ?").run(req.params.flowId);
    if (result.changes === 0) {
        res.status(404).json({ error: "not found" });
        return;
    }
    db.prepare("DELETE FROM clan_flow_schedules WHERE flow_id = ?").run(req.params.flowId);
    db.prepare("DELETE FROM clan_flow_loops WHERE flow_id = ?").run(req.params.flowId);
    auditFlowAction(req.params.clanId, siteAccountId, "server:flow.archived", req.params.flowId);
    res.status(204).end();
});

router.get("/:clanId/review-queue", (req, res) => {
    const rows = listPendingReviews(req.params.clanId);
    res.json({ reviews: rows });
});

router.post("/:clanId/review-queue/:id/approve", (req, res) => {
    const ok = approveReview(
        req.params.clanId,
        Number(req.params.id),
        { accountHash: null, rsn: null, reason: req.body?.reason ?? null },
        0,
    );
    res.json({ ok });
});

router.post("/:clanId/review-queue/:id/cancel", (req, res) => {
    const ok = cancelReview(
        req.params.clanId,
        Number(req.params.id),
        { accountHash: null, rsn: null, reason: req.body?.reason ?? null },
        0,
    );
    res.json({ ok });
});

router.post("/:clanId/:flowId/dry-run", async (req, res) => {
    try {
        const db = clanFlowsDb(req.params.clanId);
        const row = db
            .prepare("SELECT flow_id, flow_name, definition_json, published_version FROM clan_flows WHERE flow_id = ?")
            .get(req.params.flowId) as
            | { flow_id: string; flow_name: string; definition_json: string; published_version: number | null }
            | undefined;
        if (!row) {
            res.status(404).json({ error: "not found" });
            return;
        }
        const definition = parseFlowDefinition(JSON.parse(row.definition_json));
        const trace = await runDryRun({
            clanId: req.params.clanId,
            flowId: row.flow_id,
            flowName: row.flow_name,
            flowVersion: row.published_version ?? 0,
            executionId: 0,
            definition,
            event: req.body?.event ?? {},
            entity: req.body?.entity ?? {},
            variables: {},
            trackers: {},
            currentStep: definition.entry_node_id,
            wakeEventKind: null,
            wakeAt: null,
            wakeTimeoutAt: null,
        });
        res.json({ trace });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

registerApi("/api/flows", router);

export default router;
