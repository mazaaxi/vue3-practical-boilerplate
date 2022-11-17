import type { Ref, UnwrapNestedRefs } from 'vue'
import type { DeepReadonly } from 'js-common-lib'
import { Product } from '@/services/entities'
import { isImplemented } from 'js-common-lib'
import { ref } from 'vue'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

type ProductStore = UnwrapNestedRefs<WrapProductStore>

interface WrapProductStore {
  readonly all: DeepReadonly<Ref<Product[]>>
  getById(productId: string): DeepReadonly<Product> | undefined
  sgetById(productId: string): DeepReadonly<Product>
  exists(productId: string): boolean
  setAll(products: Product[]): void
  add(product: Product): DeepReadonly<Product>
  set(product: SetProduct): DeepReadonly<Product> | undefined
  remove(productId: string): Product | undefined
  decrementStock(productId: string): void
  incrementStock(productId: string): void
}

type RawProductStore = ReturnType<typeof ProductStore['newWrapInstance']>

interface SetProduct extends Partial<Product> {
  id: string
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace ProductStore {
  let instance: RawProductStore

  export function setup<T extends RawProductStore>(store?: T): T {
    instance = store ?? newWrapInstance()
    return instance as T
  }

  export function newWrapInstance() {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const all = ref<Product[]>([])

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const exists: ProductStore['exists'] = productId => {
      return Boolean(getStateProductById(productId))
    }

    const getById: ProductStore['getById'] = productId => {
      return Product.clone(getStateProductById(productId))
    }

    const sgetById: ProductStore['sgetById'] = productId => {
      const result = getById(productId)
      if (!result) {
        throw new Error(`The specified Product was not found: '${productId}'`)
      }
      return result
    }

    const setAll: ProductStore['setAll'] = products => {
      all.value.splice(0)
      for (const product of products) {
        all.value.push(Product.clone(product))
      }
    }

    const add: ProductStore['add'] = product => {
      if (exists(product.id)) {
        throw new Error(`The specified Product already exists: '${product.id}'`)
      }

      const stateItem = Product.clone(product)
      all.value.push(stateItem)
      return Product.clone(stateItem)
    }

    const set: ProductStore['set'] = product => {
      const stateItem = getStateProductById(product.id)
      if (!stateItem) {
        return
      }

      return Product.clone(Product.populate(stateItem, product))
    }

    const remove: ProductStore['remove'] = productId => {
      const foundIndex = all.value.findIndex(product => product.id === productId)
      if (foundIndex >= 0) {
        const stateItem = all.value[foundIndex]
        all.value.splice(foundIndex, 1)
        return Product.clone(stateItem)
      }
      return undefined
    }

    const decrementStock: ProductStore['decrementStock'] = productId => {
      const product = all.value.find(item => item.id === productId)
      if (!product) {
        throw new Error(`The specified Product was not found: '${productId}'`)
      }
      product.stock--
    }

    const incrementStock: ProductStore['incrementStock'] = productId => {
      const product = all.value.find(item => item.id === productId)
      if (!product) {
        throw new Error(`The specified Product was not found: '${productId}'`)
      }
      product.stock++
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getStateProductById(productId: string): Product | undefined {
      return all.value.find(item => item.id === productId)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      all,
      exists,
      getById,
      sgetById,
      setAll,
      set,
      add,
      remove,
      decrementStock,
      incrementStock,
    }

    return isImplemented<WrapProductStore, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ProductStore }
export type { SetProduct }
