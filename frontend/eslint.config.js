/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactHooks = require('eslint-plugin-react-hooks')
const tanstackEslint = require("@tanstack/eslint-plugin-query")

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', "node_modules/*"],
  },
  {

    files: ["**/*.{ts,tsx}"],
    plugins: {
            "@tanstack/query": tanstackEslint,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/display-name': 'off',
    },
  },
]);
