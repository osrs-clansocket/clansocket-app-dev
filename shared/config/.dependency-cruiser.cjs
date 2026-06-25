module.exports = {
    forbidden: [
        {
            name: "no-circular",
            severity: "error",
            comment: "Circular dependencies are forbidden — extract a shared module instead.",
            from: {},
            to: { circular: true },
        },
        {
            name: "no-orphans",
            severity: "error",
            comment: "Orphan modules suggest dead code or missing wiring.",
            from: {
                orphan: true,
                pathNot: [
                    "\\.d\\.ts$",
                    "\\.config\\.",
                    "\\.test\\.",
                    "tests?/",
                    "^scripts/",
                    "^main/electron/",
                    "^main/discord/src/plugins/",
                    "^public/",
                    "^index\\.html$",
                ],
            },
            to: {},
        },
        {
            name: "no-unresolvable",
            severity: "error",
            comment: "Imports must resolve to a real module on disk.",
            from: {},
            to: { couldNotResolve: true },
        },
        {
            name: "no-deprecated-core",
            severity: "error",
            comment: "Don't use deprecated Node.js APIs.",
            from: {},
            to: { dependencyTypes: ["core"], path: "^(punycode|domain|constants|sys|_linklist|_stream_wrap)$" },
        },
        {
            name: "not-to-test-from-src",
            severity: "error",
            comment: "Production source must not import from test files.",
            from: { pathNot: "\\.test\\.|tests?/" },
            to: { path: "\\.test\\.|tests?/" },
        },
        {
            name: "axis-2-not-in-pages",
            severity: "error",
            comment: "Axis-2 role folders (formatters/parsers/validators/etc) must NOT live under dom/pages/. They belong at feature roots.",
            from: { path: "^main/dashboard/src/dom/pages/.+/(formatters|parsers|validators|extractors|normalizers|mappers|composers|builders|resolvers|tokenizers|serializers)/" },
            to: {},
        },
        {
            name: "no-helpers-folder",
            severity: "error",
            comment: "`helpers/` is banned. Split into specific role folders (mappers/, parsers/, formatters/, etc).",
            from: {},
            to: { path: "/helpers/" },
        },
        {
            name: "no-helper-suffix",
            severity: "error",
            comment: "`*-helper.ts` is banned. Use the agent-noun role suffix (-parser, -mapper, -formatter, etc).",
            from: {},
            to: { path: "-helper\\.ts$" },
        },
        {
            name: "shared-no-feature-import",
            severity: "error",
            comment: "shared/ is axis-3 (definitions only) — must not import from any feature surface.",
            from: { path: "^clansocket-app/shared/" },
            to: { path: "^clansocket-app/main/" },
        },
    ],
    options: {
        tsPreCompilationDeps: true,
        doNotFollow: {
            path: "node_modules",
        },
        enhancedResolveOptions: {
            exportsFields: ["exports"],
            conditionNames: ["import", "require", "node", "default"],
        },
        reporterOptions: {
            text: {
                highlightFocused: true,
            },
        },
        exclude: {
            path: ["node_modules", "dist", "\\.lint-reports", "auto-gen", "varez-clan-vocab"],
        },
    },
};
