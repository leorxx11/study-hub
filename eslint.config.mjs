import eslint from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  { settings: { react: { version: "detect" } } },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    rules: {
      // Form editors intentionally synchronize drafts when their record/route changes.
      "react-hooks/set-state-in-effect": "off",
      // React Compiler cannot currently preserve a few small selector memos that
      // depend on immutable repository state; they remain valid React memoization.
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
);
