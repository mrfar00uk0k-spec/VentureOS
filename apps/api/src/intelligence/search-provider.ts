/**
 * This file is kept for backward-compatibility with any code that may still
 * import SearchProvider or SearchResultItem from this path. Both types now
 * live in ./providers/types.ts — new code should import from there directly.
 */
export type { SearchProvider, SearchResultItem } from "./providers/types";

/**
 * @deprecated Use the smart search router instead:
 *   import { smartSearch } from "./providers/search-router";
 * BraveSearchProvider is kept here only so that any remaining reference to
 * it in test files doesn't break immediately. It will be removed in a
 * future cleanup pass.
 */
export { BraveProvider as BraveSearchProvider } from "./providers/brave.provider";
