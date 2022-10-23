import { Product, generateId } from '@/services'
import { describe, expect, it } from 'vitest'
import { toBeCopyProduct, useServiceDependencies } from '@/tests/helpers'
import dayjs from 'dayjs'

//==========================================================================
//
//  Test data
//
//==========================================================================

function Products(): Product[] {
  return [
    {
      id: 'product1',
      title: 'iPad 4 Mini',
      price: 39700,
      stock: 1,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product2',
      title: 'Fire HD 8 Tablet',
      price: 8980,
      stock: 5,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product3',
      title: 'MediaPad 10',
      price: 26400,
      stock: 10,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
    {
      id: 'product4',
      title: 'Surface Go',
      price: 54290,
      stock: 0,
      createdAt: dayjs('2020-01-01'),
      updatedAt: dayjs('2020-01-02'),
    },
  ]
}

function Product1(): Product {
  return Products()[0]
}

//==========================================================================
//
//  Tests
//
//==========================================================================

describe('ProductStore', () => {
  it('all', async () => {
    const { stores } = useServiceDependencies()
    stores.product.setAll(Products())

    // run the test target
    const actual = stores.product.all

    expect(actual).toEqual(Products())
  })

  describe('getById', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.getById(Product1().id)!

      expect(actual).toEqual(Product1())

      toBeCopyProduct(stores, actual)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.getById('9999')

      expect(actual).toBeUndefined()
    })
  })

  describe('sgetById', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.sgetById(Product1().id)

      expect(actual).toEqual(Product1())

      toBeCopyProduct(stores, actual)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      let actual!: Error
      try {
        // run the test target
        stores.product.sgetById('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified Product was not found: '9999'`)
    })
  })

  describe('add', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      const productX = Product.clone(Product1())
      productX.id = generateId()
      productX.title = 'Product X'
      productX.price = 999
      productX.stock = 888

      // run the test target
      const actual = stores.product.add(productX)

      expect(actual).toEqual(productX)

      toBeCopyProduct(stores, actual)

      const added = stores.product.sgetById(productX.id)
      expect(added).toEqual(productX)
    })

    it('if product contains extra properties', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      const productX = Product.clone(Products()[0])
      productX.id = generateId()
      productX.title = 'Product X'
      productX.price = 999
      productX.stock = 888

      // run the test target
      const actual = stores.product.add({
        ...productX,
        zzz: 'zzz', // extra property
      } as any)

      expect(actual).toEqual(productX)
      expect(actual).not.toHaveProperty('zzz')

      const added = stores.product.sgetById(productX.id)
      expect(added).toEqual(productX)
      expect(added).not.toHaveProperty('zzz')

      toBeCopyProduct(stores, actual)
    })

    it('if specify a product id that already exists', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      let actual!: Error
      try {
        // run the test target
        stores.product.add(Product1())
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified Product already exists: '${Product1().id}'`)
    })
  })

  describe('set', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      const product1 = Product.clone(Products()[0])
      product1.title = 'aaa'

      // run the test target
      // NOTE: change only some properties
      const actual = stores.product.set({
        id: product1.id,
        title: product1.title,
      })!

      expect(actual).toEqual(product1)

      toBeCopyProduct(stores, actual)
    })

    it('if product contains extra properties', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      const product1 = Product.clone(Product1())

      // run the test target
      const actual = stores.product.set({
        ...product1,
        zzz: 'zzz', // extra property
      } as any)!

      expect(actual).toEqual(product1)
      expect(actual).not.toHaveProperty('zzz')

      const updated = stores.product.sgetById(product1.id)
      expect(updated).toEqual(product1)
      expect(updated).not.toHaveProperty('zzz')

      toBeCopyProduct(stores, actual)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.set({
        ...Product1(),
        id: '9999',
      })

      expect(actual).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.remove(Product1().id)!

      expect(actual).toEqual(Product1())

      toBeCopyProduct(stores, actual)
    })

    it('if a non-existent product item id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.remove(Product1().id)

      expect(actual).toBeDefined()
    })
  })

  describe('decrementStock', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.decrementStock(Product1().id)

      const updated = stores.product.sgetById(Product1().id)
      expect(updated.stock).toBe(Product1().stock - 1)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      let actual!: Error
      try {
        // run the test target
        stores.product.decrementStock('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified Product was not found: '9999'`)
    })
  })

  describe('incrementStock', () => {
    it('basic case', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      // run the test target
      const actual = stores.product.incrementStock(Product1().id)

      const updated = stores.product.sgetById(Product1().id)
      expect(updated.stock).toBe(Product1().stock + 1)
    })

    it('if a non-existent product id is specified', () => {
      const { stores } = useServiceDependencies()
      stores.product.setAll(Products())

      let actual!: Error
      try {
        // run the test target
        stores.product.incrementStock('9999')
      } catch (err: any) {
        actual = err
      }

      expect(actual.message).toBe(`The specified Product was not found: '9999'`)
    })
  })
})
