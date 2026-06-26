// Pre-existing files with Map/WeakMap/Set/WeakSet whose names match the
// cache-naming regex but aren't genuine candidates for the cache
// primitives. Each entry must have a `reason` field explaining why it's
// exempt.
//
// Path is the trailing path segment matched against the file under lint.
// New entries require explicit reasoning; the lint rule's purpose is to
// prevent ad-hoc cache patterns from sneaking in, so this list should
// stay short.

module.exports = [];
