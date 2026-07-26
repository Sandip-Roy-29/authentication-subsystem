import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: [
            "node_modules/",
            "coverage/",
            "dist/",
            "build/",
            "coverage/",
            ".env",
            ".env.*",
            "logs/",
        ],
    },

    // Base recommended JS rules
    js.configs.recommended,

    {
        files: ["**/*.{js,mjs,cjs}"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },

        rules: {
            // --- Code quality ---
            "no-unused-vars": "warn",
            "no-console": "off",

            // --- Best practices ---
            "prefer-const": "error",
            "no-var": "error",

            // --- Consistency ---
            semi: ["error", "always"],
        },
    },
]);
