import dayjs, { type Dayjs } from 'dayjs'
import { createObjectCopyFunctions } from '@/base'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface User {
  id: string
  email: string
  first: string
  last: string
  createdAt: Dayjs
  updatedAt: Dayjs
}

interface Product {
  id: string
  title: string
  price: number
  stock: number
  createdAt: Dayjs
  updatedAt: Dayjs
}

interface CartItem {
  id: string
  uid: string
  productId: string
  title: string
  price: number
  quantity: number
  createdAt: Dayjs
  updatedAt: Dayjs
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

  export function createEmptyUser(): User {
    return {
      id: '',
      email: '',
      first: '',
      last: '',
      createdAt: dayjs(0),
      updatedAt: dayjs(0),
    }
  }
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
