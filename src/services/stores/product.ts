import { ComputedRef, UnwrapRef, computed, reactive } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { Product } from '@/services/base'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface ProductStore extends UnwrapRef<RawProductStore> {
  readonly all: DeepReadonly<Product>[]
}

interface RawProductStore {
  readonly all: ComputedRef<Product[]>
  getById(productId: string): DeepReadonly<Product> | undefined
  sgetById(productId: string): DeepReadonly<Product>
  exists(productId: string): boolean
  setAll(products: Product[]): void
  add(product: Product): DeepReadonly<Product>
  set(product: SetProduct): DeepReadonly<Product> | undefined
  decrementStock(productId: string): void
  incrementStock(productId: string): void
}

interface SetProduct extends Partial<Product> {
  id: string
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace ProductStore {
  export function newRawInstance() {
    //----------------------------------------------------------------------
    //
    //  Variables
    //
    //----------------------------------------------------------------------

    const state = reactive({
      all: [] as Product[],
    })

    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const all = computed(() => [...state.all])

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
      state.all.splice(0)
      for (const product of products) {
        state.all.push(Product.clone(product))
      }
    }

    const add: ProductStore['add'] = product => {
      if (exists(product.id)) {
        throw new Error(`The specified Product already exists: '${product.id}'`)
      }

      const stateItem = Product.clone(product)
      state.all.push(stateItem)
      return Product.clone(stateItem)
    }

    const set: ProductStore['set'] = product => {
      const stateItem = getStateProductById(product.id)
      if (!stateItem) {
        return
      }

      return Product.clone(Product.populate(stateItem, product))
    }

    const decrementStock: ProductStore['decrementStock'] = productId => {
      const product = state.all.find(item => item.id === productId)
      if (!product) {
        throw new Error(`The specified Product was not found: '${productId}'`)
      }
      product.stock--
    }

    const incrementStock: ProductStore['incrementStock'] = productId => {
      const product = state.all.find(item => item.id === productId)
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
      return state.all.find(item => item.id === productId)
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
      decrementStock,
      incrementStock,
    }

    return isImplemented<RawProductStore, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { ProductStore }
