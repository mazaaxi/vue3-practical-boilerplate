module.exports = {
  plugins: ['stylelint-prettier'],
  extends: [
    'stylelint-config-recess-order',
    'stylelint-config-recommended-scss',
    'stylelint-config-recommended-vue',
    'stylelint-prettier/recommended',
  ],
  ignoreFiles: ['**/*.js', './src/styles/quasar-settings/_index.scss'],
  rules: {
    'prettier/prettier': true,
    'at-rule-no-unknown': null,
    'selector-pseudo-element-colon-notation': 'double',
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-union-class-name': true,
    'scss/no-global-function-names': null,
  },
}
