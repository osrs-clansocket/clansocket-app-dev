/**
 * LVI/no-eager-heavy-import — heavy 3D modules (three, the voxlab runtime) must
 * load via dynamic import() from surfaces outside the voxlab feature, so they
 * never land in an eager chunk and block the main thread before first paint.
 *
 * Flags a static (value) ImportDeclaration whose specifier resolves to a heavy
 * module when the importing file lives outside the voxlab feature surface.
 * Type-only imports (import type / import { type X }) are erased at build and
 * are always allowed. Dynamic import() at the use site is the prescribed form.
 *
 * Escape hatch: a file that genuinely belongs to the voxlab surface lives under
 * managers/voxlab, dom/pages/voxlab, or dom/forms/voxlab and is exempt wholesale.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const HEAVY_SPECIFIER = /(^three(\/|$))|([\\/]managers[\\/]voxlab[\\/])|(voxlab-renderer)|(voxlab-app-manager)/;
const VOXLAB_SURFACE = /[\\/](managers[\\/]voxlab|dom[\\/]pages[\\/]voxlab|dom[\\/]forms[\\/]voxlab|voxlab[\\/])/;

function isHeavySpecifier(src) {
  return HEAVY_SPECIFIER.test(src);
}

function hasValueBinding(node) {
  if (node.importKind === "type") return false;
  if (!node.specifiers || node.specifiers.length === 0) return true;
  return node.specifiers.some((s) => s.importKind !== "type");
}

module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Heavy 3D modules must be dynamically imported from non-voxlab surfaces." },
    schema: [],
    messages: { report: "{{ report }}" },
  },
  create(context) {
    const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
    if (VOXLAB_SURFACE.test(raw)) return {};
    const mod = getModuleForFile(raw);
    return {
      ImportDeclaration(node) {
        const src = node.source && node.source.value;
        if (typeof src !== "string" || !isHeavySpecifier(src)) return;
        if (!hasValueBinding(node)) return;
        const t = trace(node, raw, mod);
        context.report({
          node,
          messageId: "report",
          data: {
            report: build4DReport({
              rule: "no-eager-heavy-import",
              narrative: `Static import of a heavy 3D module ("${src}") from a non-voxlab surface. This pulls three.js plus the voxlab runtime into an eager chunk, downloaded and evaluated before the page can paint. Load it via dynamic import() so it arrives only when a model actually mounts.`,
              graph: {
                X: `${t.file}:${t.line} — static value import of "${src}" in ${t.context}`,
                Y: `the module lands in the importer's eager chunk; every surface on this import path pays three's download + evaluation before first paint`,
                Z: `no_separation — render-critical code is coupled to a heavy, optional dependency at module-load time`,
                W: `LCP regresses on every page that transitively imports this file; decorative or deferred 3D blocks the whole document`,
              },
              remediation: `Move the import to the use site as dynamic: const { X } = await import("${src}"). Keep any type-only reference as import type { X } (erased at build, never flagged). The voxlab editor surface itself (managers/voxlab, dom/pages/voxlab, dom/forms/voxlab) is exempt — it is the lazy chunk.`,
              trace: t,
            }),
          },
        });
      },
    };
  },
};
