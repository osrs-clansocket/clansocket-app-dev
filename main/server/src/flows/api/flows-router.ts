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
import "../_bootstrap.js";

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
        data_sources: Object.keys(m.data_sources),
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

router.get("/entity-attributes", (_req, res) => {
    const attrs = entityAttributes().map((a) => ({ path: a.path, label: a.label, type: a.type }));
    res.json({ attributes: attrs });
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
    try {
        const values = resolveValueOptions(scope, clanId, field, triggerType);
        res.json({ values });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
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
    try {
        const definition = parseFlowDefinition(req.body?.definition);
        const flowId = String(req.body?.flow_id ?? "");
        const flowName = String(req.body?.flow_name ?? "");
        if (!flowId || !flowName) {
            res.status(400).json({ error: "flow_id and flow_name required" });
            return;
        }
        const now = 0;
        const db = clanFlowsDb(req.params.clanId);
        db.prepare(
            "INSERT INTO clan_flows (flow_id, flow_name, definition_json, enabled, archived, created_at, updated_at) VALUES (?, ?, ?, 0, 0, ?, ?)",
        ).run(flowId, flowName, JSON.stringify(definition), now, now);
        res.status(201).json({ flow_id: flowId });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.patch("/:clanId/:flowId", (req, res) => {
    try {
        const definition = parseFlowDefinition(req.body?.definition);
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
        res.json({ flow_id: req.params.flowId });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

router.delete("/:clanId/:flowId", (req, res) => {
    const db = clanFlowsDb(req.params.clanId);
    const result = db.prepare("UPDATE clan_flows SET archived = 1 WHERE flow_id = ?").run(req.params.flowId);
    if (result.changes === 0) {
        res.status(404).json({ error: "not found" });
        return;
    }
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
        });
        res.json({ trace });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

registerApi("/api/flows", router);

export default router;
