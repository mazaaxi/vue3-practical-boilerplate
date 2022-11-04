import type { APITimestampEntity, TimestampEntity } from '@/services/base'
import type { KeysToCamel, Merge } from 'js-common-lib'
import { createObjectCopyFunctions } from '@/base'
import dayjs from 'dayjs'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface APIUser extends APITimestampEntity {
  email: string
  first: string
  last: string
}

type User = Merge<KeysToCamel<APIUser>, TimestampEntity>

interface APIProduct extends APITimestampEntity {
  title: string
  price: number
  stock: number
}

type Product = Merge<KeysToCamel<APIProduct>, TimestampEntity>

interface APICartItem extends APITimestampEntity {
  uid: string
  product_id: string
  title: string
  price: number
  quantity: number
}

type CartItem = Merge<KeysToCamel<APICartItem>, TimestampEntity>

interface APICartItemEditResponse extends APICartItem {
  product: Pick<APIProduct, 'id' | 'stock' | 'created_at' | 'updated_at'>
}

type CartItemEditResponse = Merge<
  KeysToCamel<APICartItemEditResponse>,
  TimestampEntity & {
    product: Merge<KeysToCamel<APICartItemEditResponse['product']>, TimestampEntity>
  }
>

//==========================================================================
//
//  Implementation
//
//==========================================================================

namespace User {
  export const { populate, clone } = createObjectCopyFunctions<User>((to, from) => {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.email === 'string') to.email = from.email
    if (typeof from.first === 'string') to.first = from.first
    if (typeof from.last === 'string') to.last = from.last
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to
  })
}

namespace Product {
  export const { populate, clone } = createObjectCopyFunctions<Product>((to, from) => {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.stock === 'number') to.stock = from.stock
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to
  })
}

namespace CartItem {
  export const { populate, clone } = createObjectCopyFunctions<CartItem>((to, from) => {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.uid === 'string') to.uid = from.uid
    if (typeof from.productId === 'string') to.productId = from.productId
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.quantity === 'number') to.quantity = from.quantity
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to
  })
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { CartItem, Product, User }

export type {
  APICartItem,
  APICartItemEditResponse,
  APIProduct,
  APITimestampEntity,
  APIUser,
  CartItemEditResponse,
}
