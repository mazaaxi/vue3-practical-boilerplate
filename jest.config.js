module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  globals: {
    'ts-jest': {
      diagnostics: {
        // TS2614: Module '"*.vue"' has no exported member 'xxx'. Did you mean to use 'import xxx from "*.vue"' instead?
        // TS2749: 'MyComp' refers to a value, but is being used as a type here. Did you mean 'typeof MyComp'?
        ignoreCodes: [2614, 2749],
      },
    },
  },
}
