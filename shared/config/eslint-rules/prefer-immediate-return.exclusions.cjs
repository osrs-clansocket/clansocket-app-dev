// Function-level allowlist for the `const x = expr; return x;` pattern.
// Each entry MUST include `reason` documenting the cross-rule dependency.
//
// The lint rule resolves the enclosing function name and exempts the body
// if the name matches an entry. File/folder/path are NOT inspected.

module.exports = [
    {
        function: "makeIntersectionObserver",
        reason: "lvi/no-untracked-observer walker requires assign+return pattern to verify .disconnect() reachability — direct return defeats the leak detection",
    },
    {
        function: "makeLazyObserver",
        reason: "lvi/no-untracked-observer walker requires assign+return pattern to verify .disconnect() reachability — direct return defeats the leak detection",
    },
];
