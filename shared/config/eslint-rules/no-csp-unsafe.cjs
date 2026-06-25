/**
 * LVI/no-csp-unsafe — Ban patterns that violate a strict Content Security Policy.
 *
 * The dashboard runs under a strict CSP (no `unsafe-inline`, no `unsafe-eval`,
 * no `unsafe-hashes`). Several DOM / JS APIs are silently blocked at runtime
 * by the browser when the page is served under that policy:
 *
 *   inline style attribute writes — blocked by style-src 'self'
 *     el.setAttribute("style", "...")
 *     el.setAttribute("STYLE", "...")
 *     el.setAttributeNS(null, "style", "...")
 *     factory call site: { attrs: { style: "..." } } — caught by lvi/no-raw-attrs
 *     factory typed prop  { style: "..." } — SAFE (routed through el.style.cssText)
 *
 *   inline event handler attribute writes — blocked by script-src 'self'
 *     el.setAttribute("onclick", "...")
 *     el.setAttribute("onload", "...")  (any "on*")
 *     <div onclick="..."> in HTML strings — caught at innerHTML write
 *
 *   string-form script evaluation — blocked by script-src 'self' (no unsafe-eval)
 *     eval("...")
 *     new Function("...")
 *     setTimeout("code", ...)        when first arg is a string literal
 *     setInterval("code", ...)       when first arg is a string literal
 *
 *   document.write / writeln — modifies HTML stream; commonly carries inline
 *     code that bypasses CSP analysis. Banned outright.
 *
 *   <style> textContent / <script> textContent — blocked by style-src / script-src
 *     unless a nonce/hash matches. The factory does not inject either; if a
 *     feature reaches for them it has bypassed the chokepoint.
 *
 * Why this matters:
 *   Browsers fail silently for CSP-blocked operations — the DOM mutation does
 *   not apply, but no exception is thrown. The page reaches production looking
 *   correct on the dev's machine (where CSP may be lax) and renders broken in
 *   prod. lint-time catch is the cheapest fix.
 *
 * Exempt files (the factory routes these to CSP-safe primitives):
 *   src/dom/factory/**            (writes el.style.cssText, not setAttribute)
 *
 * No inline disables. If a CSP-unsafe API is genuinely required (third-party
 * widget that needs eval-like behavior), the CSP itself needs to grow a
 * targeted exception with a nonce — not the source code.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const EXEMPT_PATH_SEGMENTS = ["/dom/factory/"];

const ATTR_SET_METHODS = new Set(["setAttribute", "setAttributeNS"]);
const DOC_WRITE_METHODS = new Set(["write", "writeln"]);
const STRING_EVAL_TIMERS = new Set(["setTimeout", "setInterval"]);

function isExemptPath(normPath) {
    for (const seg of EXEMPT_PATH_SEGMENTS) {
        if (normPath.includes(seg)) return true;
    }
    return false;
}

function literalString(node) {
    if (!node) return null;
    if (node.type === "Literal" && typeof node.value === "string") return node.value;
    if (node.type === "TemplateLiteral" && node.expressions.length === 0 && node.quasis.length === 1) {
        return node.quasis[0].value.cooked;
    }
    return null;
}

function isOnEventAttrName(name) {
    if (name.length < 3) return false;
    if (name.charCodeAt(0) !== 0x6f && name.charCodeAt(0) !== 0x4f) return false;
    if (name.charCodeAt(1) !== 0x6e && name.charCodeAt(1) !== 0x4e) return false;
    return true;
}

function isStyleAttrName(name) {
    return name.toLowerCase() === "style";
}

function isDocumentWriteCall(call) {
    const c = call.callee;
    if (!c || c.type !== "MemberExpression") return null;
    const obj = c.object;
    const prop = c.property && c.property.name;
    if (!prop || !DOC_WRITE_METHODS.has(prop)) return null;
    if (obj && obj.type === "Identifier" && obj.name === "document") return prop;
    return null;
}

function explain(kind, label) {
    if (kind === "inline-style-attr") {
        return `Inline style attribute write (${label}) — CSP style-src blocks setAttribute("style", ...). Use el.style.cssText or the factory's typed { style: "..." } prop (which routes through cssText)`;
    }
    if (kind === "inline-event-attr") {
        return `Inline event handler attribute write (${label}) — CSP script-src blocks setAttribute("${label}", ...). Use el.addEventListener (or the factory's wireClick / onClick prop) for handlers, never inline strings`;
    }
    if (kind === "eval") {
        return `Direct script eval (eval) — CSP script-src blocks eval() without unsafe-eval. There is no factory equivalent; rewrite the code path to avoid dynamic code generation`;
    }
    if (kind === "new-function") {
        return `Function constructor (new Function(...)) — CSP script-src blocks new Function without unsafe-eval. Same as eval; rewrite to a typed callable instead of string-built code`;
    }
    if (kind === "string-timer") {
        return `String-form timer (${label}(string, ...)) — CSP script-src blocks string-arg setTimeout/setInterval. Pass a function: ${label}(() => ..., ms)`;
    }
    if (kind === "document-write") {
        return `document.${label}() — modifies the HTML stream and commonly carries inline code. Banned under strict CSP. Use the factory to compose nodes instead`;
    }
    return `CSP-unsafe pattern`;
}

function remediation(kind) {
    if (kind === "inline-style-attr") {
        return `Replace with el.style.cssText = "..." (property mutation is CSP-safe under style-src 'self'), or use the factory's { style: "..." } typed prop which routes through cssText automatically.`;
    }
    if (kind === "inline-event-attr") {
        return `Use el.addEventListener("event", fn) inside the factory layer, or pass an onClick / onSubmit / wireClick / wireSubmit prop. Inline string handlers are universally blocked.`;
    }
    if (kind === "eval" || kind === "new-function") {
        return `Rewrite. There is no CSP-friendly alternative under strict policy. If the data flow requires dynamic dispatch, use a lookup table / registry of pre-defined callables instead.`;
    }
    if (kind === "string-timer") {
        return `Pass a function reference: setTimeout(() => doWork(), ms). String args of setTimeout/setInterval are an eval call in disguise.`;
    }
    if (kind === "document-write") {
        return `Use the factory's composition primitives (div, span, etc.) and mount them through Instance.mount(parent). document.write rewrites the HTML stream and is incompatible with any modern hydration / CSP setup.`;
    }
    return `Remove the CSP-unsafe pattern.`;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Ban patterns that violate the strict Content Security Policy." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptPath(raw)) return {};
        const mod = getModuleForFile(raw);

        function report(node, kind, label) {
            const t = trace(node, raw, mod);
            context.report({
                node,
                messageId: "report",
                data: {
                    report: build4DReport({
                        rule: "no-csp-unsafe",
                        narrative: `${explain(kind, label)}. Under the dashboard's strict CSP (no unsafe-inline / unsafe-eval / unsafe-hashes), this call is silently blocked by the browser at runtime — the DOM mutation never applies and no exception is thrown.`,
                        graph: {
                            X: `${t.file}:${t.line} — ${label} called in ${t.context}`,
                            Y: `strict CSP blocks this API; the page renders broken in prod even though dev works`,
                            Z: `no_csp_compliance — the call cannot succeed under the production policy and there is no per-call fix that makes it safe`,
                            W: `every CSP-unsafe site is a silent failure mode in prod; lint-time catch is the only cheap fix because runtime gives no error`,
                        },
                        remediation: remediation(kind),
                        trace: t,
                    }),
                },
            });
        }

        return {
            CallExpression(node) {
                const callee = node.callee;
                if (!callee) return;

                if (callee.type === "Identifier") {
                    if (callee.name === "eval") {
                        report(node, "eval", "eval");
                        return;
                    }
                    if (STRING_EVAL_TIMERS.has(callee.name)) {
                        const firstArg = node.arguments[0];
                        if (firstArg && literalString(firstArg) !== null) {
                            report(node, "string-timer", callee.name);
                        }
                        return;
                    }
                    return;
                }

                if (callee.type === "MemberExpression") {
                    const docWrite = isDocumentWriteCall(node);
                    if (docWrite) {
                        report(node, "document-write", docWrite);
                        return;
                    }
                    const methodName = callee.property && callee.property.name;
                    if (!methodName || !ATTR_SET_METHODS.has(methodName)) return;
                    const attrNameIdx = methodName === "setAttributeNS" ? 1 : 0;
                    const attrNameNode = node.arguments[attrNameIdx];
                    const attrName = literalString(attrNameNode);
                    if (attrName === null) return;
                    if (isStyleAttrName(attrName)) {
                        report(node, "inline-style-attr", `${methodName}("${attrName}", ...)`);
                        return;
                    }
                    if (isOnEventAttrName(attrName)) {
                        report(node, "inline-event-attr", attrName);
                        return;
                    }
                }
            },
            NewExpression(node) {
                const callee = node.callee;
                if (callee && callee.type === "Identifier" && callee.name === "Function") {
                    report(node, "new-function", "new Function");
                }
            },
        };
    },
};
