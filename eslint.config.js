import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["node_modules", "dist", "build", "coverage"],
  },
  js.configs.recommended,
  {
    files: ["packages/**/*.js", "packages/**/*.jsx"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];