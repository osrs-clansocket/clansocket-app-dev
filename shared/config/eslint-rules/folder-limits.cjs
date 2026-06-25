/**
 * LVI/folder-limits — Smell detector for semantic drift into a folder.
 * Not a structural enforcer. Trips at 20 source files — a threshold
 * legitimate concern folders rarely cross. When it trips, audit the
 * folder for outliers (files whose concern doesnt fit), do NOT
 * mechanically subdivide.
 */
const path = require("path");
const fs = require("fs");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const folderCounts = new Map();
const reported = new Set();

module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Smell-detect semantic drift into a folder — audit for outliers, do not mechanically split" },
    schema: [{ type: "object", properties: { max: { type: "number" } }, additionalProperties: false }],
    messages: { report: "{{ report }}" },
  },
  create(context) {
    const max = (context.options[0] && context.options[0].max) || 20;
    const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
    const mod = getModuleForFile(raw) || "unknown";
    const folder = path.dirname(raw).replace(/\\/g, "/");
    return {
      Program(node) {
        if (!folderCounts.has(folder)) {
          try {
            const entries = fs.readdirSync(folder).filter((e) => {
              const ext = path.extname(e).toLowerCase();
              return [".js", ".ts", ".cjs", ".mjs", ".jsx", ".tsx"].includes(ext);
            });
            folderCounts.set(folder, entries.length);
          } catch { return; }
        }
        const count = folderCounts.get(folder);
        if (count <= max || reported.has(folder)) return;
        reported.add(folder);
        const t = trace(node, raw, mod);
        const short = folder.split("/src/").pop() || folder.split("/main/").pop() || folder;
        context.report({ node, messageId: "report", data: { report: build4DReport({
          rule: "folder-limits",
          narrative: `${short}/ has ${count} source files (threshold ${max}). This is a SMELL not a structural failure. A legitimate concern folder rarely exceeds ${max} files — at this count, the probability that something has drifted in from a different domain becomes high enough to require an audit.`,
          graph: {
            X: `${short}/ — ${count} files, ${max} threshold`,
            Y: `at this size, files of mixed concern can hide in the noise — discovery and reasoning costs rise`,
            Z: `concern alignment — every file in a folder should fit the folder's concern; drift accumulates silently`,
            W: `flagged ONCE per folder — fix surfaces every overgrown concern boundary in the codebase`,
          },
          remediation: `READ every file in ${short}/. For each, ask:
1. Does this file's concern align with the folder's concern?
2. Is there a more fitting concern folder in this domain path?
3. Is this file's concern actually distinct enough to deserve its own concern folder at the same level?
Move outliers to where they belong. Do NOT create role-subfolders (appliers/, builders/, formatters/, primitives/) inside the concern folder just to satisfy the count — that is mechanical nesting, not semantic placement. The file suffix (-applier, -builder, -formatter) already carries the role; the folder carries the concern.`,
          trace: t,
        }) } });
      },
    };
  },
};
