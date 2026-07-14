import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import jestPlugin from 'eslint-plugin-jest'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  {
    files: ['postman-sync/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
      },
    },
  },
  {
    files: ['ApiResponse.ts'],
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
  },
  {
    files: ['tests/**/*.ts'],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/expect-expect': 'off',
    },
  },
]
