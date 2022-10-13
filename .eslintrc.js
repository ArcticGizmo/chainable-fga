module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // indent: ['warn', 2, { SwitchCase: 1 }],
    indent: 'off',
    '@typescript-eslint/indent': ['warn', 2, { SwitchCase: 1 }],
    quotes: [2, 'single', { avoidEscape: true }],
    semi: ['error', 'always']
  }
};
