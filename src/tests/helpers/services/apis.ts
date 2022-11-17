import { AppAPIs } from '@/services/apis'
import type { RawAppAPIs } from '@/services/apis'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestAPIs extends RawAppAPIs {
  putTestData(testData: any): Promise<void>
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestAPIs {
  export function newInstance(): TestAPIs {
    return mix(AppAPIs.newInstance())
  }

  function mix<T extends RawAppAPIs>(api: T): TestAPIs {
    const putTestData: TestAPIs['putTestData'] = async testData => {
      await api.client.put('test_data', { data: testData })
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
