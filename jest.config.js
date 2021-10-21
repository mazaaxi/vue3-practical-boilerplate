module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  globals: {
    'ts-jest': {
      diagnostics: {
        // TS2614: Module '"*.vue"' has no exported member 'xxx'. Did you mean to use 'import xxx from "*.vue"' instead?
        ignoreCodes: [2614],
      },
    },
  },
}
