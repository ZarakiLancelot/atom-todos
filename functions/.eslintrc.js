module.exports = {
  root: true,
  env: { es6: true, node: true },
  ignorePatterns: [
    'lib/**',
    'generated/**',
    'node_modules/**',
    '.eslintrc.js',
  ],
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        'quotes': ['error', 'double', { avoidEscape: true }],
        'semi': ['error', 'always'],
        'indent': ['error', 2, { SwitchCase: 1 }],
        'object-curly-spacing': ['error', 'always'],
        'max-len': ['error', { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
        'comma-dangle': ['error', 'always-multiline'],
        'prefer-const': 'error',
        'eqeqeq': ['error', 'smart'],
        'curly': ['error', 'all'],
        'import/no-unresolved': 'off',
        'import/order': ['warn', {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        }],
        '@typescript-eslint/no-unused-vars': ['warn', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'new-cap': ['error', { capIsNew: false, newIsCap: true }],
      },
    },
    {
      files: ['**/*.js'],
      extends: ['eslint:recommended'],
    },
  ],
};
