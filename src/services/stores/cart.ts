import { ComputedRef, Ref, computed, ref } from 'vue'
import { DeepReadonly, isImplemented } from 'js-common-lib'
import { CartItem } from '@/services/base'
import { UnwrapNestedRefs } from '@vue/reactivity'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface CartStore extends UnwrapNestedRefs<RawCartStore> {}

interface RawCartStore {
  readonly all: DeepReadonly<Ref<CartItem[]>>
  readonly totalPrice: ComputedRef<number>
  getById(cartItemId: string): CartItem | undefined
  sgetById(cartItemId: string): CartItem
  getByProductId(productId: string): CartItem | undefined
  sgetByProductId(productId: string): CartItem
  exists(productId: string): boolean
  setAll(items: CartItem[]): void
  add(item: CartItem): CartItem
  set(item: SetCartItem): CartItem | undefined
  remove(cartItemId: string): CartItem | undefined
  removeByUID(uid: string): CartItem[]
  clear(): void
}

interface SetCartItem extends Partial<Omit<CartItem, 'uid' | 'productId'>> {
  id: string
}

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace CartStore {
  export function newRawInstance() {
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    const all = ref<CartItem[]>([])

    const totalPrice = computed(() => {
      const result = all.value.reduce((result, item) => {
        return result + item.price * item.quantity
      }, 0)
      return result
    })

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    const exists: CartStore['exists'] = cartItemId => {
      return Boolean(getStateCartItemById(cartItemId))
    }

    const getById: CartStore['getById'] = cartItemId => {
      return CartItem.clone(getStateCartItemById(cartItemId))
    }

    const sgetById: CartStore['sgetById'] = cartItemId => {
      const result = getById(cartItemId)
      if (!result) {
        throw new Error(`The specified CartItem was not found: '${cartItemId}'`)
      }
      return result
    }

    const getByProductId: CartStore['getByProductId'] = productId => {
      const stateItem = all.value.find(item => item.productId === productId)
      return CartItem.clone(stateItem)
    }

    const sgetByProductId: CartStore['sgetByProductId'] = productId => {
      const result = getByProductId(productId)
      if (!result) {
        throw new Error(`The specified CartItem was not found: ${JSON.stringify({ productId })}`)
      }
      return result
    }

    const setAll: CartStore['setAll'] = items => {
      all.value.splice(0)
      for (const item of items) {
        all.value.push(CartItem.clone(item))
      }
    }

    const add: CartStore['add'] = item => {
      if (exists(item.id)) {
        throw new Error(`The specified CartItem already exists: '${item.id}'`)
      }

      const stateItem = CartItem.clone(item)
      all.value.push(stateItem)
      return CartItem.clone(stateItem)
    }

    const set: CartStore['set'] = item => {
      const stateItem = getStateCartItemById(item.id)
      if (!stateItem) {
        return
      }

      return CartItem.clone(CartItem.populate(stateItem, item))
    }

    const remove: CartStore['remove'] = cartItemId => {
      const foundIndex = all.value.findIndex(cartItem => cartItem.id === cartItemId)
      if (foundIndex >= 0) {
        const stateItem = all.value[foundIndex]
        all.value.splice(foundIndex, 1)
        return CartItem.clone(stateItem)
      }
      return undefined
    }

    const removeByUID: CartStore['removeByUID'] = uid => {
      const result: CartItem[] = []
      for (const cartItem of [...all.value]) {
        if (cartItem.uid === uid) {
          result.push(remove(cartItem.id)!)
        }
      }
      return result
    }

    const clear: CartStore['clear'] = () => {
      all.value.splice(0, all.value.length)
    }

    //----------------------------------------------------------------------
    //
    //  Internal methods
    //
    //----------------------------------------------------------------------

    function getStateCartItemById(cartItemId: string): CartItem | undefined {
      return all.value.find(item => item.id === cartItemId)
    }

    //----------------------------------------------------------------------
    //
    //  Result
    //
    //----------------------------------------------------------------------

    const instance = {
      all,
      totalPrice,
      exists,
      getById,
      sgetById,
      getByProductId,
      sgetByProductId,
      setAll,
      set,
      add,
      remove,
      removeByUID,
      clear,
    }

    return isImplemented<RawCartStore, typeof instance>(instance)
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { CartStore }
