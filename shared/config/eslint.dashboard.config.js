import js from "@eslint/js";
import tseslint from "typescript-eslint";
import css from "@eslint/css";
import stylistic from "@stylistic/eslint-plugin";
import sonarjs from "eslint-plugin-sonarjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const universalRules = require("./universal-rules.cjs");
const noMixedCssScopes = require("./eslint-rules/no-mixed-css-scopes.cjs");
const noSingleVarAlias = require("./eslint-rules/no-single-var-alias.cjs");
const requireDeepLink = require("./eslint-rules/require-deep-link.cjs");
const noRawDom = require("./eslint-rules/no-raw-dom.cjs");
const noRawAttrs = require("./eslint-rules/no-raw-attrs.cjs");
const noCspUnsafe = require("./eslint-rules/no-csp-unsafe.cjs");
const requireComponent = require("./eslint-rules/require-component.cjs");
const requireAriaLabel = require("./eslint-rules/require-aria-label.cjs");
const requireStyleClass = require("./eslint-rules/require-style-class.cjs");
const noRawHandler = require("./eslint-rules/no-raw-handler.cjs");
const noRawEffect = require("./eslint-rules/no-raw-effect.cjs");
const noRawReactive = require("./eslint-rules/no-raw-reactive.cjs");
const noRawAnimation = require("./eslint-rules/no-raw-animation.cjs");
const noImperativeRoute = require("./eslint-rules/no-imperative-route.cjs");
const noModal = require("./eslint-rules/no-modal.cjs");
const requireRsnTag = require("./eslint-rules/require-rsn-tag.cjs");
const noRawSizes = require("./eslint-rules/no-raw-sizes.cjs");
const noWhereSelector = require("./eslint-rules/no-where-selector.cjs");
const noUndefinedToken = require("./eslint-rules/no-undefined-token.cjs");
const noPixelatedImageRendering = require("./eslint-rules/no-pixelated-image-rendering.cjs");
const noRawRead = require("./eslint-rules/no-raw-read.cjs");
const noUndefinedColumn = require("./eslint-rules/no-undefined-column.cjs");
const requireContextMeta = require("./eslint-rules/require-context-meta.cjs");
const mirrorPages = require("./eslint-rules/mirror-pages.cjs");
const persistedSignalKeyLiteral = require("./eslint-rules/persisted-signal-key-literal.cjs");
const persistedSignalKeyShape = require("./eslint-rules/persisted-signal-key-shape.cjs");
const noDirectLocalstorage = require("./eslint-rules/no-direct-localstorage.cjs");
const noAdHocCache = require("./eslint-rules/no-ad-hoc-cache.cjs");
const noEffectRebuild = require("./eslint-rules/no-effect-rebuild.cjs");
const pagesMustRender = require("./eslint-rules/pages-must-render.cjs");
const stateNoRender = require("./eslint-rules/state-no-render.cjs");
const noInlineClasses = require("./eslint-rules/no-inline-classes.cjs");
const routeCssImport = require("./eslint-rules/route-css-import.cjs");
const routeRequiresSeo = require("./eslint-rules/route-requires-seo.cjs");
const noBareEffect = require("./eslint-rules/no-bare-effect.cjs");
const noTempWrapperInstance = require("./eslint-rules/no-temp-wrapper-instance.cjs");
const noEagerHeavyImport = require("./eslint-rules/no-eager-heavy-import.cjs");
// no-untracked-observer + manager-needs-barrel live in universal-rules.cjs
// — generic AST shape, no dashboard-specific substrate invariant.

const dashboardSpecificRules = {
  "require-deep-link": requireDeepLink,
  "no-raw-dom": noRawDom,
  "no-raw-attrs": noRawAttrs,
  "no-csp-unsafe": noCspUnsafe,
  "require-component": requireComponent,
  "require-aria-label": requireAriaLabel,
  "require-style-class": requireStyleClass,
  "no-raw-handler": noRawHandler,
  "no-raw-effect": noRawEffect,
  "no-raw-reactive": noRawReactive,
  "no-raw-animation": noRawAnimation,
  "no-imperative-route": noImperativeRoute,
  "no-modal": noModal,
  "require-rsn-tag": requireRsnTag,
  "no-raw-read": noRawRead,
  "no-undefined-column": noUndefinedColumn,
  "require-context-meta": requireContextMeta,
  "mirror-pages": mirrorPages,
  "persisted-signal-key-literal": persistedSignalKeyLiteral,
  "persisted-signal-key-shape": persistedSignalKeyShape,
  "no-direct-localstorage": noDirectLocalstorage,
  "no-ad-hoc-cache": noAdHocCache,
  "no-effect-rebuild": noEffectRebuild,
  "pages-must-render": pagesMustRender,
  "state-no-render": stateNoRender,
  "no-inline-classes": noInlineClasses,
  "route-css-import": routeCssImport,
  "route-requires-seo": routeRequiresSeo,
  "no-bare-effect": noBareEffect,
  "no-temp-wrapper-instance": noTempWrapperInstance,
  "no-eager-heavy-import": noEagerHeavyImport,
};

const dashboardSpecificSeverities = {
  "lvi/require-deep-link": "error",
  "lvi/no-raw-dom": "error",
  "lvi/no-csp-unsafe": "error",
  "lvi/no-raw-attrs": "error",
  "lvi/require-component": "error",
  "lvi/require-aria-label": "error",
  "lvi/require-style-class": "error",
  "lvi/no-raw-handler": "error",
  "lvi/no-raw-effect": "error",
  "lvi/no-raw-reactive": "error",
  "lvi/no-raw-animation": "error",
  "lvi/no-imperative-route": "error",
  "lvi/no-modal": "error",
  "lvi/require-rsn-tag": "error",
  "lvi/no-raw-read": "error",
  "lvi/no-undefined-column": "error",
  "lvi/require-context-meta": "error",
  "lvi/mirror-pages": "error",
  "lvi/persisted-signal-key-literal": "error",
  "lvi/persisted-signal-key-shape": "error",
  "lvi/no-direct-localstorage": "error",
  "lvi/no-ad-hoc-cache": "error",
  "lvi/no-effect-rebuild": "error",
  "lvi/pages-must-render": "error",
  "lvi/state-no-render": "error",
  "lvi/no-inline-classes": "error",
  "lvi/route-css-import": "error",
  "lvi/route-requires-seo": "error",
  "lvi/no-bare-effect": "error",
  "lvi/no-temp-wrapper-instance": "error",
  "lvi/no-eager-heavy-import": "error",
};

export default tseslint.config(
  { files: ["**/*.{ts,tsx,js,mjs,cjs}"], ...js.configs.recommended },
  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: c.files || ["**/*.{ts,tsx}"],
  })),
  {
    files: ["main/dashboard/src/**/*.ts"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      "@stylistic": stylistic,
      sonarjs,
      "lvi": {
        rules: {
          ...universalRules.rules,
          ...dashboardSpecificRules,
        },
      },
    },
    rules: {
      ...universalRules.severities,
      ...dashboardSpecificSeverities,

      "sonarjs/argument-type": "error",
      "sonarjs/arguments-order": "error",
      "sonarjs/arguments-usage": "error",
      "sonarjs/array-callback-without-return": "error",
      "sonarjs/array-constructor": "error",
      "sonarjs/bool-param-default": "error",
      "sonarjs/call-argument-line": "error",
      "sonarjs/certificate-transparency": "error",
      "sonarjs/code-eval": "error",
      "sonarjs/cognitive-complexity": ["error", 15],
      "sonarjs/confidential-information-logging": "error",
      "sonarjs/constructor-for-side-effects": "error",
      "sonarjs/content-length": "error",
      "sonarjs/content-security-policy": "error",
      "sonarjs/cookie-no-httponly": "error",
      "sonarjs/cookies": "error",
      "sonarjs/cors": "error",
      "sonarjs/csrf": "error",
      "sonarjs/cyclomatic-complexity": "error",
      "sonarjs/deprecation": "error",
      "sonarjs/different-types-comparison": "error",
      "sonarjs/disabled-auto-escaping": "error",
      "sonarjs/disabled-resource-integrity": "error",
      "sonarjs/disabled-timeout": "error",
      "sonarjs/dns-prefetching": "error",
      "sonarjs/dompurify-unsafe-config": "error",
      "sonarjs/dynamically-constructed-templates": "error",
      // Superseded by lvi/no-untracked-encryption (same detection +
      // function-level allowlist via no-untracked-encryption.exclusions.cjs).
      "sonarjs/encryption": "off",
      "sonarjs/encryption-secure-mode": "error",
      "sonarjs/expression-complexity": "error",
      "sonarjs/file-permissions": "error",
      "sonarjs/file-uploads": "error",
      "sonarjs/for-loop-increment-sign": "error",
      "sonarjs/frame-ancestors": "error",
      "sonarjs/function-inside-loop": "error",
      "sonarjs/function-return-type": "error",
      "sonarjs/generator-without-yield": "error",
      "sonarjs/hashing": "error",
      "sonarjs/hidden-files": "error",
      "sonarjs/in-operator-type-error": "error",
      "sonarjs/inconsistent-function-call": "error",
      "sonarjs/index-of-compare-to-positive-number": "error",
      "sonarjs/insecure-cookie": "error",
      "sonarjs/insecure-jwt-token": "error",
      "sonarjs/link-with-target-blank": "error",
      "sonarjs/max-switch-cases": "error",
      "sonarjs/max-union-size": "error",
      "sonarjs/misplaced-loop-counter": "error",
      "sonarjs/new-operator-misuse": "error",
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-array-delete": "error",
      "sonarjs/no-async-constructor": "error",
      "sonarjs/no-built-in-override": "error",
      "sonarjs/no-case-label-in-switch": "error",
      "sonarjs/no-clear-text-protocols": "error",
      "sonarjs/no-collapsible-if": "error",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-dead-store": "error",
      "sonarjs/no-duplicate-in-composite": "error",
      "sonarjs/no-duplicated-branches": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-empty-collection": "error",
      "sonarjs/no-equals-in-for-termination": "error",
      "sonarjs/no-extra-arguments": "error",
      "sonarjs/no-fallthrough": "error",
      "sonarjs/no-for-in-iterable": "error",
      "sonarjs/no-function-declaration-in-block": "error",
      "sonarjs/no-global-this": "error",
      "sonarjs/no-globals-shadowing": "error",
      "sonarjs/no-gratuitous-expressions": "error",
      "sonarjs/no-hardcoded-ip": "error",
      "sonarjs/no-hardcoded-passwords": "error",
      "sonarjs/no-hardcoded-secrets": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-ignored-exceptions": "error",
      "sonarjs/no-ignored-return": "error",
      "sonarjs/no-implicit-global": "error",
      "sonarjs/no-in-misuse": "error",
      "sonarjs/no-inconsistent-returns": "error",
      "sonarjs/no-incorrect-string-concat": "error",
      "sonarjs/no-internal-api-use": "error",
      "sonarjs/no-intrusive-permissions": "error",
      "sonarjs/no-invariant-returns": "error",
      "sonarjs/no-inverted-boolean-check": "error",
      "sonarjs/no-ip-forward": "error",
      "sonarjs/no-literal-call": "error",
      "sonarjs/no-mime-sniff": "error",
      "sonarjs/no-misleading-array-reverse": "error",
      "sonarjs/no-mixed-content": "error",
      "sonarjs/no-nested-assignment": "error",
      "sonarjs/no-nested-conditional": "error",
      "sonarjs/no-nested-functions": "error",
      "sonarjs/no-nested-incdec": "error",
      "sonarjs/no-nested-switch": "error",
      "sonarjs/no-nested-template-literals": "error",
      "sonarjs/no-os-command-from-path": "error",
      "sonarjs/no-parameter-reassignment": "error",
      "sonarjs/no-primitive-wrappers": "error",
      "sonarjs/no-redundant-assignments": "error",
      "sonarjs/no-redundant-boolean": "error",
      "sonarjs/no-redundant-jump": "error",
      "sonarjs/no-redundant-optional": "error",
      "sonarjs/no-redundant-parentheses": "error",
      "sonarjs/no-referrer-policy": "error",
      "sonarjs/no-same-argument-assert": "error",
      "sonarjs/no-same-line-conditional": "error",
      "sonarjs/no-selector-parameter": "error",
      "sonarjs/no-session-cookies-on-static-assets": "error",
      "sonarjs/no-small-switch": "error",
      "sonarjs/no-try-promise": "error",
      "sonarjs/no-undefined-argument": "error",
      "sonarjs/no-undefined-assignment": "error",
      "sonarjs/no-unenclosed-multiline-block": "error",
      "sonarjs/no-unsafe-unzip": "error",
      "sonarjs/no-unthrown-error": "error",
      "sonarjs/no-unused-collection": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/no-useless-catch": "error",
      "sonarjs/no-useless-increment": "error",
      "sonarjs/no-useless-intersection": "error",
      "sonarjs/no-variable-usage-before-declaration": "error",
      "sonarjs/no-weak-cipher": "error",
      "sonarjs/no-weak-keys": "error",
      // Conflicts with factory barrel re-export architecture (single import
      // surface via `export * from "./X"` chain). Project doctrine wins.
      "sonarjs/no-wildcard-import": "off",
      "sonarjs/non-existent-operator": "error",
      "sonarjs/non-number-in-arithmetic-expression": "error",
      "sonarjs/null-dereference": "error",
      "sonarjs/operation-returning-nan": "error",
      "sonarjs/os-command": "error",
      "sonarjs/post-message": "error",
      "sonarjs/prefer-default-last": "error",
      // Superseded by lvi/prefer-immediate-return (same detection +
      // function-level allowlist for cross-rule reconciliation with
      // lvi/no-untracked-observer).
      "sonarjs/prefer-immediate-return": "off",
      "sonarjs/prefer-object-literal": "error",
      "sonarjs/prefer-promise-shorthand": "error",
      "sonarjs/prefer-single-boolean-return": "error",
      "sonarjs/prefer-type-guard": "error",
      "sonarjs/prefer-while": "error",
      "sonarjs/process-argv": "error",
      "sonarjs/production-debug": "error",
      // Superseded by lvi/no-untracked-pseudo-random (same detection +
      // function-level allowlist via no-untracked-pseudo-random.exclusions.cjs).
      "sonarjs/pseudo-random": "off",
      "sonarjs/public-static-readonly": "error",
      "sonarjs/publicly-writable-directories": "error",
      "sonarjs/reduce-initial-value": "error",
      "sonarjs/redundant-type-aliases": "error",
      "sonarjs/session-regeneration": "error",
      "sonarjs/shorthand-property-grouping": "error",
      "sonarjs/sockets": "error",
      "sonarjs/sql-queries": "error",
      "sonarjs/standard-input": "error",
      "sonarjs/strict-transport-security": "error",
      "sonarjs/strings-comparison": "error",
      "sonarjs/too-many-break-or-continue-in-loop": "error",
      "sonarjs/unverified-certificate": "error",
      "sonarjs/unverified-hostname": "error",
      "sonarjs/updated-const-var": "error",
      "sonarjs/updated-loop-counter": "error",
      "sonarjs/use-type-alias": "error",
      "sonarjs/useless-string-operation": "error",
      "sonarjs/values-not-convertible-to-numbers": "error",
      // Conflicts with lvi/no-floating-promise which uses `void X` as the
      // explicit fire-and-forget marker (TS-ecosystem standard idiom). lvi
      // wins as project-authored doctrine.
      "sonarjs/void-use": "off",
      "sonarjs/weak-ssl": "error",
      "sonarjs/x-powered-by": "error",
      "sonarjs/xml-parser-xxe": "error",
      "sonarjs/xpath": "error",

      "no-empty": "off",
      "no-trailing-spaces": "off",
      "no-multiple-empty-lines": "off",
      "eol-last": "off",
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@stylistic/eol-last": "error",

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["main/dashboard/src/styles/**/*.css"],
    language: "css/css",
    plugins: {
      css,
      "lvi": {
        rules: {
          "no-mixed-css-scopes": noMixedCssScopes,
          "no-raw-sizes": noRawSizes,
          "no-single-var-alias": noSingleVarAlias,
          "no-where-selector": noWhereSelector,
          "no-undefined-token": noUndefinedToken,
          "no-pixelated-image-rendering": noPixelatedImageRendering,
          "mirror-pages": mirrorPages,
        },
      },
    },
    rules: {
      "lvi/mirror-pages": "error",
      "lvi/no-mixed-css-scopes": "error",
      "lvi/no-raw-sizes": "error",
      "lvi/no-single-var-alias": "error",
      "lvi/no-where-selector": "error",
      "lvi/no-undefined-token": "error",
      "lvi/no-pixelated-image-rendering": "error",

      "css/font-family-fallbacks": "error",
      "css/no-duplicate-imports": "error",
      "css/no-duplicate-keyframe-selectors": "error",
      "css/no-empty-blocks": "error",
      "css/no-important": "error",
      "css/no-invalid-at-rule-placement": "error",
      "css/no-invalid-at-rules": "error",
      "css/no-invalid-named-grid-areas": "error",
      "css/no-invalid-properties": ["error", { allowUnknownVariables: true }],
      "css/no-unmatchable-selectors": "error",
      "css/prefer-logical-properties": "error",
      "css/relative-font-units": ["error", { allowUnits: ["rem", "em", "%"] }],
      "css/use-baseline": "off",
      "css/use-layers": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.*",
      "main/dashboard/src/vite-env.d.ts",
      "main/dashboard/src/styles/auto-gen/**",
    ],
  },
);
