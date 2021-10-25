import merge from 'lodash/merge'

interface BuildEnv {
  api: {
    protocol: string
    host: string
    port: number
    basePath: string
  }
}

const base: BuildEnv = {
  api: {
    protocol: '',
    host: '',
    port: 0,
    basePath: '',
  },
}

function getBuildEnv(): BuildEnv {
  return {
    remote: merge({}, base, {
      api: {
        protocol: 'https',
        host: 'example.com',
        port: 443,
        basePath: 'api',
      },
    }),
    predeploy: merge({}, base, {
      api: {
        port: 5051,
        basePath: 'api',
      },
    }),
    local: merge({}, base, {
      api: {
        port: 5051,
        basePath: 'api',
      },
    }),
    test: merge({}, base, {
      api: {
        port: 5051,
        basePath: 'test-api',
      },
    }),
  }[process.env.BUILD_ENV]
}

export { getBuildEnv }
