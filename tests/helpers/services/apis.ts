import { APIContainer } from '@/services/apis'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestAPIContainer extends APIContainer {
  putTestData(testData: any): Promise<void>
}

type RawAPIContainer = ReturnType<typeof APIContainer['newRawInstance']>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestAPIContainer {
  export function newInstance(): TestAPIContainer {
    const api = APIContainer.newRawInstance()
    return mix(api)
  }

  function mix<T extends RawAPIContainer>(api: T): TestAPIContainer & T {
    const putTestData: TestAPIContainer['putTestData'] = async testData => {
      await api.client.put('testData', testData)
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

export { TestAPIContainer }
