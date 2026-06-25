/**
 * Files exempt from lvi/no-timer-heuristic.
 *
 * Three legitimate categories:
 *   1. wire-protocol — timer is intrinsic to a network protocol (ws keep-alive, handshake deadline, fetch abort)
 *   2. event-coalescer — trigger IS an event (fs watcher, queue enqueue), timer just debounces / batches
 *   3. tooling — dev-only scripts, not production code path
 *
 * Path is matched as a suffix against the file's normalized path
 * (forward slashes, relative from repo root). Whole file is exempt — no per-line granularity.
 *
 * When adding an entry: the `reason` must say WHY a timer is acceptable here.
 * If the answer is "convenience" or "i didnt want to refactor", the answer is wrong — refactor instead.
 */
module.exports = [
    {
        path: "main/server/src/plugin-api/transport/server.ts",
        reason: "wire-protocol — ws heartbeat ping setInterval detects dead tcp. wire-level keep-alive, not business scheduling.",
    },
    {
        path: "main/server/src/plugin-api/session/socket-state.ts",
        reason: "wire-protocol — identity-handshake deadline setTimeout closes ws if plugin never sends identity. wire-level keep-alive, not business scheduling.",
    },
    {
        path: "main/server/src/plugin-api/handlers/identity-phases.ts",
        reason: "wire-protocol — clears the identity-handshake deadline timer set by session/socket-state.ts once plugin completes the handshake. paired with the deadline setTimeout, same wire-protocol concern.",
    },
    {
        path: "main/server/src/plugin-api/transport/connection.ts",
        reason: "wire-protocol — clears the identity-handshake deadline timer set by session/socket-state.ts on ws close/error. paired with the deadline setTimeout, same wire-protocol concern.",
    },
    {
        path: "main/server/src/ai/routes/chat/stream.ts",
        reason: "event-coalescer — sleep() waits for the LLM-specified nextPollSeconds between chain iterations with abortRef polling. trigger IS the LLM step's nextPollSeconds value; setTimeout is the wake-up alarm. abort-aware so it never outlives the connection.",
    },
    {
        path: "main/server/src/ai/persona/prompt-loader/registry.ts",
        reason: "event-coalescer — fs-watcher fires on every file write. timer debounces editor-save bursts into one reload. trigger IS the watcher event.",
    },
    {
        path: "main/server/src/dev.ts",
        reason: "tooling — npm run dev script. polls until the tsx-launched server binds its port. dev-only, never ships to production.",
    },
    {
        path: "main/server/src/wom/dispatcher/wake-scheduler.ts",
        reason: "event-coalescer — outbound rate-limited HTTPS to api.wiseoldman.net per PAG-WOM-API-RATE-COMPLIANCE. trigger IS each enqueue (or response completion). db is canonical source of truth for scheduled_at / next_attempt_at; setTimeout is the wake-up alarm, db is re-checked on fire to handle drift / cancellations. (extracted from dispatcher.ts to break A↔B cycle with queue-processor.ts)",
    },
    {
        path: "main/server/src/wom/dispatcher/sdk-handlers.ts",
        reason: "event-coalescer — setTimeout wraps each SDK call with a 30s timeout (Promise.race) so a hung api.wiseoldman.net request can't block the per-clan timer indefinitely. trigger IS the SDK call; timeout is bounded per-request, not a polling loop. SDK provides no native abort.",
    },
];
