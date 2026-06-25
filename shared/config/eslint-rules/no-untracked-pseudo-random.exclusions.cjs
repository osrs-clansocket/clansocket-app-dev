// Function-level allowlist for Math.random() calls.
// Each entry MUST include `reason` documenting the review.
//
// The lint rule resolves the enclosing function name (FunctionDeclaration
// or MethodDefinition) and exempts the call if the name matches an entry.
// File/folder/path are NOT inspected — only the function identifier.

module.exports = [
    {
        function: "nextFloat",
        reason: "non-crypto random chokepoint at main/dashboard/src/shared/random/non-crypto-random.ts — visual variation only, reviewed",
    },
    {
        function: "nextInt",
        reason: "non-crypto random chokepoint at main/dashboard/src/shared/random/non-crypto-random.ts — visual variation only, reviewed",
    },
];
