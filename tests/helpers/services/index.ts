import { Entity, ServiceContainer } from '@/services'
import { UnwrapRef, reactive } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface TestServiceContainer extends UnwrapRef<ReturnType<typeof ServiceContainer['newRawInstance']>> {}

type TestShopService = TestServiceContainer['shop']

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace TestServiceContainer {
  export function newInstance(): TestServiceContainer {
    return reactive(ServiceContainer.newRawInstance())
  }
}

/**
 * 指定されたアイテムがコピーであることを検証します。
 * @param actual
 * @param expected
 */
function expectNotToBeCopyEntity<T extends Entity>(actual: T | T[], expected: T | T[]): void {
  const actualItems = Array.isArray(actual) ? (actual as T[]) : [actual as T]
  const expectedItems = Array.isArray(expected) ? (expected as T[]) : [expected as T]

  for (let i = 0; i < actualItems.length; i++) {
    const actualItemItem = actualItems[i]
    const expectedItem = expectedItems[i]
    expect(actualItemItem.id).toBe(expectedItem.id)
    expect(actualItemItem).not.toBe(expectedItem)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { TestServiceContainer, TestShopService, expectNotToBeCopyEntity }
export * from './apis'
export * from './stores'
export * from './helpers'
