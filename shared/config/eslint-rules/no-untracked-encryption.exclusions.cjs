// Function-level allowlist for crypto.subtle.encrypt/decrypt calls.
// Each entry MUST include `reason` documenting the review.
//
// The lint rule resolves the enclosing function name (FunctionDeclaration
// or MethodDefinition) and exempts the call if the name matches an entry.
// File/folder/path are NOT inspected — only the function identifier.

module.exports = [
    {
        function: "encrypt",
        reason: "AES-GCM chokepoint at main/dashboard/src/ai/vault/crypto.ts — random IV per call, reviewed",
    },
    {
        function: "decrypt",
        reason: "AES-GCM decrypt chokepoint at main/dashboard/src/ai/vault/crypto.ts — IV from EncryptedBlob, reviewed",
    },
];
