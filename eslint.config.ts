import { fixupConfigRules } from '@eslint/compat'
import js from '@eslint/js'
import importX from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import perfectionist from 'eslint-plugin-perfectionist'
import playwright from 'eslint-plugin-playwright'
import promise from 'eslint-plugin-promise'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import regexp from 'eslint-plugin-regexp'
import sonarjs from 'eslint-plugin-sonarjs'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const sonarRules = fixupConfigRules([sonarjs.configs.recommended])

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'test/e2e/**']),

  // ── Base layer: JS/TS foundation for all source files ──
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
      promise.configs['flat/recommended'],
      regexp.configs['flat/recommended'],
      unicorn.configs['flat/recommended'],
      ...sonarRules,
    ],
    plugins: {
      perfectionist,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
    settings: {
      'import-x/resolver': { typescript: true },
    },
    rules: {
      // TS unused vars — handled by unused-imports (auto-fix)
      '@typescript-eslint/no-unused-vars': 'off',
      'sonarjs/no-unused-vars': 'off',

      // unused-imports — auto-fix
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // perfectionist — auto-sort
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          groups: [
            'type',
            ['builtin', 'external'],
            'internal',
            ['parent', 'sibling', 'index'],
            'style',
          ],
          newlinesBetween: 1,
          internalPattern: ['^@/.+'],
        },
      ],
      'perfectionist/sort-named-imports': 'error',
      'perfectionist/sort-jsx-props': 'error',

      // unicorn — recommended with overrides
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],
      'unicorn/no-null': 'warn',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/default-export-style': 'off',
      'unicorn/prefer-number-properties': 'off',

      // complexity — safety net
      'sonarjs/cognitive-complexity': ['error', 15],
      'max-depth': ['warn', { max: 4 }],
      'max-lines': ['warn', { max: 300 }],
      'max-lines-per-function': ['warn', { max: 120 }],


    },
  },

  // ── React layer: JSX-only plugins (scoped to .tsx) ──
  {
    files: ['**/*.tsx'],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      ...fixupConfigRules([reactPlugin.configs.flat.recommended]),
      jsxA11y.flatConfigs.recommended,
    ],
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // ── Policy layer: project-wide coding standards ──
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      eqeqeq: 'error',
    },
  },

  // ── Overrides for files with co-located sub-components ──
  {
    files: [
      'src/components/SavingsGoalForm.tsx',
      'src/pages/TransactionsPage.tsx',
    ],
    rules: {
      'max-lines': 'off',
    },
  },

  // ── Config file overrides ──
  {
    files: ['eslint.config.ts'],
    rules: {
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },

  // ── Test layer: relaxed rules for test files ──
  {
    files: ['test/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      'unicorn/no-null': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-depth': 'off',
      'sonarjs/cognitive-complexity': 'off',
    },
  },

  // ── E2E: Playwright ──
  {
    files: ['test/e2e/**/*.{ts,tsx}'],
    ...playwright.configs['flat/recommended'],
  },

  // ── Declaration files ──
  {
    files: ['*.d.ts', '**/*.d.ts'],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },
])
