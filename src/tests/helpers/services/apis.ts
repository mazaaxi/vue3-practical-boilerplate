import { APIs } from '@/services/apis'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestAPIs extends APIs {
  putTestData(testData: any): Promise<void>
}

type WrapAPIs = ReturnType<typeof APIs['newInstance']>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestAPIs {
  export function newInstance(): TestAPIs {
    const api = APIs.newInstance()
    return mix(api)
  }

  function mix<T extends WrapAPIs>(api: T): TestAPIs & T {
    const putTestData: TestAPIs['putTestData'] = async testData => {
      await api.client.put('test_data', testData)
    }

    return {
      ...api,
      putTestData,
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestAPIs }
