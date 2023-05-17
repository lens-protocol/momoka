module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  ignorePatterns: ['.eslintrc.js', '*.json', '*.test.ts', '*.mock.ts'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'prefer-arrow'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
    'import/internal-regex': '^@lens/',
  },
  rules: {
    '@typescript-eslint/comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        enums: 'always-multiline',
        functions: 'never',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      { types: { Function: false, Boolean: false }, extendDefaults: true },
    ],
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    '@typescript-eslint/no-empty-interface': ['warn'],
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': ['warn'],
    // '@typescript-eslint/naming-convention': [
    //   'error',
    //   {
    //     selector: 'default',
    //     format: ['camelCase', 'PascalCase'],
    //     leadingUnderscore: 'allow',
    //   },
    //   {
    //     selector: 'typeProperty',
    //     format: null,
    //   },
    //   {
    //     selector: ['interface', 'typeLike'],
    //     format: ['PascalCase'],
    //   },
    //   {
    //     selector: 'variable',
    //     modifiers: ['const'],
    //     format: ['camelCase', 'UPPER_CASE'],
    //     leadingUnderscore: 'allow',
    //   },
    //   {
    //     selector: 'enumMember',
    //     format: ['UPPER_CASE'],
    //   },
    // ],
    'require-await': ['error'],
    'capitalized-comments': 'off',
    'no-control-regex': 'off',
    'no-empty': 'warn',
    'no-shadow': 'off',
    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    // 'array-element-newline': ['error', 'consistent'],
    'arrow-body-style': 'off',
    // 'max-len': [
    //   'error',
    //   {
    //     code: 120,
    //     ignoreComments: true,
    //     ignorePattern: '^import .*$',
    //     ignoreStrings: true,
    //     ignoreTemplateLiterals: true,
    //     ignoreRegExpLiterals: true,
    //   },
    // ],
    'max-statements-per-line': 'error',
    'no-case-declarations': 'off',
    'no-constant-condition': 'warn',
  },
};
