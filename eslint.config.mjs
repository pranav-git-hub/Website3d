import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['vite.config.*', 'eslint.config.*'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // Console logging is used for runtime error reporting/debugging in this app.
      'no-console': 'off',
    },
  },
];


