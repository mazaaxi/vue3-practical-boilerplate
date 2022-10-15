import { DeepPartial, DeepReadonly, DeepUnreadonly, nonNullable } from 'js-common-lib'
import dayjs, { Dayjs } from 'dayjs'
import { customAlphabet } from 'nanoid'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Entity {
  id: string
}

interface EntityTimestamp {
  createdAt: Dayjs
  updatedAt: Dayjs
}

type TimestampEntity = Entity & EntityTimestamp

type ToRawEntity<T> = ToDeepRawDate<T>

type ToEntity<T> = ToDeepEntityDateAre<T, 'createdAt' | 'updatedAt'>

type ToEntityDate<T> = T extends undefined
  ? undefined
  : T extends null
  ? null
  : T extends string
  ? Dayjs
  : T extends string | undefined
  ? Dayjs | undefined
  : T extends string | null
  ? Dayjs | null
  : T extends string | undefined | null
  ? Dayjs | undefined | null
  : T

type ToDeepEntityDateAre<T, K extends keyof any> = {
  [P in keyof T]: P extends K ? Dayjs : ToDeepEntityDateAre<T[P], K>
}

type ToRawDate<T> = T extends Dayjs
  ? string
  : T extends Dayjs | undefined
  ? string | undefined
  : T extends Dayjs | null
  ? string | null
  : T extends Dayjs | undefined | null
  ? string | undefined | null
  : T

type ToDeepRawDate<T> = {
  [K in keyof T]: T[K] extends Dayjs
    ? string
    : T[K] extends Dayjs | undefined
    ? string | undefined
    : T[K] extends Dayjs | null
    ? string | null
    : T[K] extends Dayjs | undefined | null
    ? string | undefined | null
    : T[K] extends Array<infer R>
    ? Array<ToDeepRawDate<R>>
    : T[K] extends Array<infer R> | undefined
    ? Array<ToDeepRawDate<R>> | undefined
    : T[K] extends Array<infer R> | null
    ? Array<ToDeepRawDate<R>> | null
    : T[K] extends Array<infer R> | undefined | null
    ? Array<ToDeepRawDate<R>> | undefined | null
    : ToDeepRawDate<T[K]>
}

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

/**
 * Converts a string date to entity date type.
 */
function toEntityDate<T extends string | undefined | null>(rawDate: T): ToEntityDate<T> {
  if (rawDate === undefined) return undefined as ToEntityDate<T>
  if (rawDate === null) return null as ToEntityDate<T>
  return dayjs(rawDate as string) as ToEntityDate<T>
}

/**
 * Converts string date properties of an object to entity date type.
 * @param obj A target object
 * @param props Target string date property names
 */
function toDeepEntityDate<T, K extends keyof any>(obj: T, props: K[]): ToDeepEntityDateAre<T, K> {
  if (!obj) return obj as any

  for (const prop of Object.getOwnPropertyNames(obj)) {
    const value = (obj as any)[prop]
    if (!nonNullable(value) || dayjs.isDayjs(value)) continue

    if (props.includes(prop as any) && typeof value === 'string') {
      ;(obj as any)[prop] = dayjs(value)
    }

    if (Array.isArray(value)) {
      value.forEach(item => toDeepEntityDate(item, props))
    } else if (typeof value === 'object') {
      toDeepEntityDate(value, props)
    }
  }

  return obj as any as ToDeepEntityDateAre<T, K>
}

/**
 * Converts entity date type to string date.
 */
function toRawDate<T extends Dayjs | undefined | null>(entityDate: T): ToRawDate<T> {
  if (entityDate === undefined) return undefined as ToRawDate<T>
  if (entityDate === null) return null as ToRawDate<T>
  return entityDate.toISOString() as ToRawDate<T>
}

/**
 * Converts an entity date type properties of an object to date string.
 */
function toDeepRawDate<T>(obj: T): ToDeepRawDate<T> {
  if (!obj) return obj as any

  for (const prop of Object.getOwnPropertyNames(obj)) {
    const value = (obj as any)[prop]
    if (!nonNullable(value)) continue

    if (dayjs.isDayjs(value)) {
      ;(obj as any)[prop] = toRawDate(value)
    }

    if (Array.isArray(value)) {
      value.forEach(item => toDeepRawDate(item))
    } else if (typeof value === 'object') {
      toDeepRawDate(value)
    }
  }

  return obj as any as ToDeepRawDate<T>
}

/**
 * Converts an entity retrieved from API to an entity in application format.
 */
function toEntity<T>(rawEntity: T): ToEntity<T> {
  return toDeepEntityDate(rawEntity, ['createdAt', 'updatedAt'])
}

/**
 * Converts entities retrieved from API to entities in application format.
 */
function toEntities<T>(rawEntities: T[]): ToEntity<T>[] {
  return rawEntities.map(rawEntity => toEntity(rawEntity)!)
}

/**
 * Converts an entity to an entity in API format.
 */
function toRawEntity<T>(entity: T): ToDeepRawDate<T> {
  return toDeepRawDate(entity)
}

/**
 * Converts entities to entities in API format.
 */
function toRawEntities<T>(entities: T[]): ToDeepRawDate<T>[] {
  return entities.map(entity => toRawEntity(entity)!)
}

function generateId(): string {
  const nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    20
  )
  return nanoid()
}

namespace User {
  export function populate<
    TO extends DeepPartial<User>,
    FM extends DeepPartial<DeepReadonly<User>>
  >(to: TO, from: FM): DeepUnreadonly<FM & TO> {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.email === 'string') to.email = from.email
    if (typeof from.first === 'string') to.first = from.first
    if (typeof from.last === 'string') to.last = from.last
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to as DeepUnreadonly<FM & TO>
  }

  export function clone<T extends User | User[] | undefined | null>(source: DeepReadonly<T>): T {
    if (!source) return source as T
    if (Array.isArray(source)) {
      const list = source as DeepReadonly<User>[]
      return list.map(item => clone(item)) as T
    } else {
      const item = source as DeepReadonly<User>
      return populate({}, item) as T
    }
  }
}

namespace Product {
  export function populate<
    TO extends DeepPartial<Product>,
    FM extends DeepPartial<DeepReadonly<Product>>
  >(to: TO, from: FM): DeepUnreadonly<FM & TO> {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.stock === 'number') to.stock = from.stock
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to as DeepUnreadonly<FM & TO>
  }

  export function clone<
    T extends DeepReadonly<Product> | DeepReadonly<Product[]> | undefined | null
  >(source: T): DeepUnreadonly<T> {
    if (!source) return source as DeepUnreadonly<T>
    if (Array.isArray(source)) {
      const list = source as DeepReadonly<Product>[]
      return list.map(item => clone(item)) as DeepUnreadonly<T>
    } else {
      const item = source as DeepReadonly<Product>
      return populate({}, item) as DeepUnreadonly<T>
    }
  }
}

namespace CartItem {
  export function populate<
    TO extends DeepPartial<CartItem>,
    FM extends DeepPartial<DeepReadonly<CartItem>>
  >(to: TO, from: FM): DeepUnreadonly<FM & TO> {
    if (typeof from.id === 'string') to.id = from.id
    if (typeof from.uid === 'string') to.uid = from.uid
    if (typeof from.productId === 'string') to.productId = from.productId
    if (typeof from.title === 'string') to.title = from.title
    if (typeof from.price === 'number') to.price = from.price
    if (typeof from.quantity === 'number') to.quantity = from.quantity
    if (dayjs.isDayjs(from.createdAt)) to.createdAt = dayjs(from.createdAt)
    if (dayjs.isDayjs(from.updatedAt)) to.updatedAt = dayjs(from.updatedAt)
    return to as DeepUnreadonly<FM & TO>
  }

  export function clone<
    T extends DeepReadonly<CartItem> | DeepReadonly<CartItem[]> | undefined | null
  >(source: T): DeepUnreadonly<T> {
    if (!source) return source as DeepUnreadonly<T>
    if (Array.isArray(source)) {
      const list = source as DeepReadonly<CartItem>[]
      return list.map(item => clone(item)) as DeepUnreadonly<T>
    } else {
      const item = source as DeepUnreadonly<CartItem>
      return populate({}, item) as DeepUnreadonly<T>
    }
  }
}

//==========================================================================
//
//  Export
//
//==========================================================================

export {
  CartItem,
  Entity,
  EntityTimestamp,
  Product,
  TimestampEntity,
  ToDeepEntityDateAre,
  ToDeepRawDate,
  ToEntity,
  ToEntityDate,
  ToRawDate,
  ToRawEntity,
  User,
  generateId,
  toDeepEntityDate,
  toDeepRawDate,
  toEntities,
  toEntity,
  toEntityDate,
  toRawDate,
  toRawEntities,
  toRawEntity,
}
