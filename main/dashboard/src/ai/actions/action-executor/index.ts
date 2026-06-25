import type {
    Actions,
    ActionResult,
    CheckOp,
    PressKeyOp,
    SelectOptionOp,
    SetValueOp,
    ToggleOpenOp,
} from "../action-types.js";
import { appendSkipped, reportAudit } from "./audit-report.js";
import { type ExecuteOptions } from "./constants.js";
import { doHighlight, doNavigate, doRoute, doShow } from "./display.js";
import {
    doBlur,
    doCheck,
    doClick,
    doFocus,
    doPressKey,
    doSelectOption,
    doSetValue,
    doSubmit,
    doToggleOpen,
} from "./forms.js";

const ARRAY_DISPATCHERS = [
    ["setValue", (op: SetValueOp) => doSetValue(op)],
    ["check", (op: CheckOp) => doCheck(op)],
    ["selectOption", (op: SelectOptionOp) => doSelectOption(op)],
    ["pressKey", (op: PressKeyOp) => doPressKey(op)],
    ["toggleOpen", (op: ToggleOpenOp) => doToggleOpen(op)],
] as const;

const SINGLE_DISPATCHERS = [
    ["click", doClick],
    ["submit", doSubmit],
    ["focus", doFocus],
    ["blur", doBlur],
    ["navigate", doNavigate],
    ["show", doShow],
] as const;

function dispatchArrayOps(actions: Actions, results: ActionResult[]): void {
    for (const [key, dispatcher] of ARRAY_DISPATCHERS) {
        const ops = actions[key];
        if (!ops) continue;
        for (const op of ops) results.push((dispatcher as (o: typeof op) => ActionResult)(op));
    }
}

function dispatchSingleTargets(actions: Actions, results: ActionResult[]): void {
    for (const [key, dispatcher] of SINGLE_DISPATCHERS) {
        const target = actions[key];
        if (target) results.push(dispatcher(target));
    }
    if (actions.highlight) results.push(...doHighlight(actions.highlight));
}

function emitAudit(opts: ExecuteOptions, results: ActionResult[]): void {
    if (!opts.silent) for (const r of results) reportAudit(opts.chainId, r);
}

export async function executeActions(actions: Actions | null, opts: ExecuteOptions = {}): Promise<ActionResult[]> {
    if (!actions) return [];
    const results: ActionResult[] = [];
    if (actions.route) {
        results.push(doRoute(actions.route));
        appendSkipped(actions, results);
        emitAudit(opts, results);
        return results;
    }
    dispatchArrayOps(actions, results);
    dispatchSingleTargets(actions, results);
    emitAudit(opts, results);
    return results;
}
