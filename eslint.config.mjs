// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import sonarjs from "eslint-plugin-sonarjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended,

  // Typed linting
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      // --- CRITICAL ERROR PREVENTION ---
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "no-shadow": "off", 
      "@typescript-eslint/no-shadow": "error", // Prevents variable shadowing bugs
      
      // --- ASYNC & PROMISE SAFETY (The "Later" Errors) ---
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-spread": "error", 
      
      // --- ARCHITECTURAL INTEGRITY ---
      "import/no-cycle": "error", // Prevents circular dependencies that break builds
      "import/no-self-import": "error",
      "import/order": ["error", { 
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }],

      // --- AGENT GUIDANCE (Strictness) ---
      "@typescript-eslint/no-explicit-any": "error", // No more warnings, force proper types
      "@typescript-eslint/no-non-null-assertion": "error", // Force safety checks
      "@typescript-eslint/no-unnecessary-condition": "error", // Cleanup dead code path
      
      // --- COGNITIVE LOAD ---
      "sonarjs/cognitive-complexity": ["error", 15], // Prevents "spaghetti" logic
      "sonarjs/no-duplicate-string": "warn",

      // --- CODE QUALITY & UNUSED VARS ---
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],

      // --- REACT/NEXT SPECIFIC ---
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error", // Prevents stale closures in useEffect
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "generated/**",
    "*.config.js",
  ]),
]);