// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/app/cookie-policy*/page.tsx",
      "src/app/privacy*/page.tsx",
      "src/app/terms*/page.tsx",
      "src/app/data-deletion*/page.tsx",
    ],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
    },
  },

  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".cursor/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    "generated/**",
    "*.config.js",
  ]),
]);
