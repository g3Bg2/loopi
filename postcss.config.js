// Re-export the real PostCSS config so tooling can find the plugin configuration.
// Use an ESM re-export to satisfy the linter while keeping the canonical config
// in `postcss.config.cjs` for tooling that requires CommonJS.
export { default } from "./postcss.config.cjs";
