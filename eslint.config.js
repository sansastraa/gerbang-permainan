import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["games/**", "node_modules/**", "data/**", "output/**"] },
  js.configs.recommended,
  { files: ["hub/public/**/*.js"], languageOptions: { sourceType: "module", globals: { ...globals.browser } } },
  { files: ["**/*.mjs"], ignores: ["hub/public/**"], languageOptions: { sourceType: "module", globals: { ...globals.node, ...globals.browser } } },
  { rules: { "no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },
];
