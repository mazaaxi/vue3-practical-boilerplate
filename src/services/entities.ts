import type { TimestampEntity } from '@/services/base'
import { createObjectCopyFunctions } from '@/base'
import dayjs from 'dayjs'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface User extends TimestampEntity {
  email: string
  first: string
  last: string
}

interface Product extends TimestampEntity {
  title: string
  price: number
  stock: number
}

interface CartItem extends TimestampEntity {
  uid: string
  productId: string
  title: string
  price: number
  quantity: number
}

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
