module.exports = {
  plugins: ['stylelint-prettier'],
  extends: [
    'stylelint-config-recess-order',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue',
    'stylelint-prettier/recommended',
  ],
  ignoreFiles: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
  rules: {
    'prettier/prettier': true,
    'at-rule-no-unknown': null,
    'selector-pseudo-element-colon-notation': 'double',
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-union-class-name': true,
    'scss/no-global-function-names': null,
  },
  overrides: [
    {
      files: ['**/*.{scss,sass}'],
      rules: {
        'selector-class-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected class name to be lower kebab or snake case' },
        ],
        'scss/dollar-variable-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected variable name to be lower kebab or snake case' },
        ],
        'scss/percent-placeholder-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected placeholder name to be lower kebab or snake case' },
        ],
        'scss/at-mixin-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected mixin name to be lower kebab or snake case' },
        ],
        'scss/at-function-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected function name to be lower kebab or snake case' },
        ],
        'keyframes-name-pattern': [
          '^[a-z][a-z0-9-_]+$',
          { message: 'Expected keyframes name to be lower kebab or snake case' },
        ],
      },
    },
  ],
}
