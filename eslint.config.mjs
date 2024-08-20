import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
    ignores: ['node_modules/', '.env', '**/build/**'], // Use ignores to specify files and directories to ignore
    rules: {
      // Add any specific rules here if needed
    },



    
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
];

