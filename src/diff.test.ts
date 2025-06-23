import { AsymmetricAssertion } from './AsymmetricAssertion'
import { TestsRunner } from './TestsRunner'
import { AnythingAssertion } from './asymmetric-assertions/AnythingAssertion'
import { ContainAssertion } from './asymmetric-assertions/ContainAssertion'
import { GreaterThanAssertion } from './asymmetric-assertions/GreaterThanAssertion'
import { diff } from './diff'
import { evaluateTestResults } from './utils.test'

export async function diffTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('diff', () => {
    selfTestsRunner.describe('primitive values', () => {
      selfTestsRunner.test('should return same for identical primitives', () => {
        const result1 = diff(42, 42)
        const result2 = diff('hello', 'hello')
        const result3 = diff(true, true)
        const result4 = diff(false, false)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: 42, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: 'hello', same: true })
        selfTestsRunner.expect(result3).toEqual({ type: 'same', value: true, same: true })
        selfTestsRunner.expect(result4).toEqual({ type: 'same', value: false, same: true })
      })

      selfTestsRunner.test('should return different for different primitives', () => {
        const result1 = diff(42, 43)
        const result2 = diff('hello', 'world')
        const result3 = diff(true, false)

        selfTestsRunner.expect(result1).toEqual({ type: 'different', expected: 42, actual: 43, same: false })
        selfTestsRunner.expect(result2).toEqual({ type: 'different', expected: 'hello', actual: 'world', same: false })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: true, actual: false, same: false })
      })

      selfTestsRunner.test('should return different for different types', () => {
        const result1 = diff(42, '42')
        const result2 = diff(true, 1)
        const result3 = diff(null, 0)
        const result4 = diff(undefined, null)

        selfTestsRunner.expect(result1).toEqual({ type: 'different', expected: 42, actual: '42', same: false })
        selfTestsRunner.expect(result2).toEqual({ type: 'different', expected: true, actual: 1, same: false })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: null, actual: 0, same: false })
        selfTestsRunner.expect(result4).toEqual({ type: 'different', expected: undefined, actual: null, same: false })
      })
    })

    selfTestsRunner.describe('special values', () => {
      selfTestsRunner.test('should handle NaN correctly', () => {
        const result1 = diff(NaN, NaN)
        const result2 = diff(NaN, 42)
        const result3 = diff(42, NaN)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: NaN, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'different', expected: NaN, actual: 42, same: false })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: 42, actual: NaN, same: false })
      })

      selfTestsRunner.test('should handle null and undefined', () => {
        const result1 = diff(null, null)
        const result2 = diff(undefined, undefined)
        const result3 = diff(null, undefined)
        const result4 = diff(undefined, null)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: null, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: undefined, same: true })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: null, actual: undefined, same: false })
        selfTestsRunner.expect(result4).toEqual({ type: 'different', expected: undefined, actual: null, same: false })
      })

      selfTestsRunner.test('should handle zero values', () => {
        const result1 = diff(0, 0)
        const result2 = diff(-0, 0)
        const result3 = diff(0, -0)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: 0, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: -0, same: true })
        selfTestsRunner.expect(result3).toEqual({ type: 'same', value: 0, same: true })
      })
    })

    selfTestsRunner.describe('arrays', () => {
      selfTestsRunner.test('should return same for identical arrays', () => {
        const result1 = diff([], [])
        const result2 = diff([1, 2, 3], [1, 2, 3])
        const result3 = diff(['a', 'b'], ['a', 'b'])

        selfTestsRunner.expect(result1).toEqual({ type: 'array', items: [], same: true })
        selfTestsRunner.expect(result2).toEqual({
          type: 'array',
          items: [
            { type: 'same', value: 1, same: true },
            { type: 'same', value: 2, same: true },
            { type: 'same', value: 3, same: true }
          ],
          same: true
        })
        selfTestsRunner.expect(result3.same).toBe(true)
        selfTestsRunner.expect(result3.type).toBe('array')
      })

      selfTestsRunner.test('should return different for arrays with different values', () => {
        const result = diff([1, 2, 3], [1, 2, 4])

        selfTestsRunner.expect(result).toEqual({
          type: 'array',
          items: [
            { type: 'same', value: 1, same: true },
            { type: 'same', value: 2, same: true },
            { type: 'different', expected: 3, actual: 4, same: false }
          ],
          same: false
        })
      })

      selfTestsRunner.test('should handle arrays with different lengths', () => {
        const result1 = diff([1, 2], [1, 2, 3])
        const result2 = diff([1, 2, 3], [1, 2])

        selfTestsRunner.expect(result1).toEqual({
          type: 'array',
          items: [
            { type: 'same', value: 1, same: true },
            { type: 'same', value: 2, same: true },
            { type: 'added', value: 3, same: false }
          ],
          same: false
        })

        selfTestsRunner.expect(result2).toEqual({
          type: 'array',
          items: [
            { type: 'same', value: 1, same: true },
            { type: 'same', value: 2, same: true },
            { type: 'removed', value: 3, same: false }
          ],
          same: false
        })
      })

      selfTestsRunner.test('should handle nested arrays', () => {
        const result1 = diff(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [1, 2],
            [3, 4]
          ]
        )
        const result2 = diff(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [1, 2],
            [3, 5]
          ]
        )

        selfTestsRunner.expect(result1.same).toBe(true)
        selfTestsRunner.expect(result1.type).toBe('array')

        selfTestsRunner.expect(result2.same).toBe(false)
        selfTestsRunner.expect(result2.type).toBe('array')
      })

      selfTestsRunner.test('should differentiate arrays from non-arrays', () => {
        const result1 = diff([1, 2, 3], { 0: 1, 1: 2, 2: 3 })
        const result2 = diff({ 0: 1, 1: 2, 2: 3 }, [1, 2, 3])

        selfTestsRunner.expect(result1).toEqual({ type: 'different', expected: [1, 2, 3], actual: { 0: 1, 1: 2, 2: 3 }, same: false })
        selfTestsRunner.expect(result2).toEqual({ type: 'different', expected: { 0: 1, 1: 2, 2: 3 }, actual: [1, 2, 3], same: false })
      })
    })

    selfTestsRunner.describe('objects', () => {
      selfTestsRunner.test('should return same for identical objects', () => {
        const result1 = diff({}, {})
        const result2 = diff({ a: 1, b: 2 }, { a: 1, b: 2 })
        const result3 = diff({ name: 'test', value: 42 }, { name: 'test', value: 42 })

        selfTestsRunner.expect(result1).toEqual({ type: 'object', keys: {}, same: true })
        selfTestsRunner.expect(result2).toEqual({
          type: 'object',
          keys: {
            a: { type: 'same', value: 1, same: true },
            b: { type: 'same', value: 2, same: true }
          },
          same: true
        })
        selfTestsRunner.expect(result3.same).toBe(true)
        selfTestsRunner.expect(result3.type).toBe('object')
      })

      selfTestsRunner.test('should return different for objects with different values', () => {
        const result = diff({ a: 1, b: 2 }, { a: 1, b: 3 })

        selfTestsRunner.expect(result).toEqual({
          type: 'object',
          keys: {
            a: { type: 'same', value: 1, same: true },
            b: { type: 'different', expected: 2, actual: 3, same: false }
          },
          same: false
        })
      })

      selfTestsRunner.test('should handle objects with added keys', () => {
        const result = diff({ a: 1 }, { a: 1, b: 2 })

        selfTestsRunner.expect(result).toEqual({
          type: 'object',
          keys: {
            a: { type: 'same', value: 1, same: true },
            b: { type: 'added', value: 2, same: false }
          },
          same: false
        })
      })

      selfTestsRunner.test('should handle objects with removed keys', () => {
        const result = diff({ a: 1, b: 2 }, { a: 1 })

        selfTestsRunner.expect(result).toEqual({
          type: 'object',
          keys: {
            a: { type: 'same', value: 1, same: true },
            b: { type: 'removed', value: 2, same: false }
          },
          same: false
        })
      })

      selfTestsRunner.test('should handle nested objects', () => {
        const result1 = diff({ user: { name: 'John', age: 30 } }, { user: { name: 'John', age: 30 } })
        const result2 = diff({ user: { name: 'John', age: 30 } }, { user: { name: 'John', age: 31 } })

        selfTestsRunner.expect(result1.same).toBe(true)
        selfTestsRunner.expect(result1.type).toBe('object')

        selfTestsRunner.expect(result2.same).toBe(false)
        selfTestsRunner.expect(result2.type).toBe('object')
      })
    })

    selfTestsRunner.describe('circular references', () => {
      selfTestsRunner.test('should handle circular object references', () => {
        const obj1: any = { a: 1 }
        obj1.self = obj1

        const obj2: any = { a: 1 }
        obj2.self = obj2

        const result1 = diff(obj1, obj2)
        selfTestsRunner.expect(result1.type).toBe('object')
        selfTestsRunner.expect(result1.same).toBe(true)

        const obj3: any = { a: 2 }
        obj3.self = obj3

        const result2 = diff(obj1, obj3)
        selfTestsRunner.expect(result2.same).toBe(false)
      })

      selfTestsRunner.test('should handle circular array references', () => {
        const arr1: any = [1, 2]
        arr1.push(arr1)

        const arr2: any = [1, 2]
        arr2.push(arr2)

        const result1 = diff(arr1, arr2)
        selfTestsRunner.expect(result1.type).toBe('array')
        selfTestsRunner.expect(result1.same).toBe(true)

        const arr3: any = [1, 3]
        arr3.push(arr3)

        const result2 = diff(arr1, arr3)
        selfTestsRunner.expect(result2.same).toBe(false)
      })

      selfTestsRunner.test('should handle mixed circular references', () => {
        const obj: any = { items: [] }
        obj.items.push(obj)

        const obj2: any = { items: [] }
        obj2.items.push(obj2)

        const result = diff(obj, obj2)
        selfTestsRunner.expect(result.type).toBe('object')
        selfTestsRunner.expect(result.same).toBe(true)
      })
    })

    selfTestsRunner.describe('asymmetric assertions', () => {
      selfTestsRunner.test('should handle asymmetric assertions that match', () => {
        const anythingAssertion = new AnythingAssertion()
        const result1 = diff(anythingAssertion, 42)
        const result2 = diff(anythingAssertion, 'hello')
        const result3 = diff(anythingAssertion, null)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: 42, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: 'hello', same: true })
        selfTestsRunner.expect(result3).toEqual({ type: 'same', value: null, same: true })
      })

      selfTestsRunner.test('should detect asymmetric assertions correctly', () => {
        const anythingAssertion = new AnythingAssertion()
        const regularObject = { name: 'test' }

        // Test the static method that detects asymmetric assertions
        selfTestsRunner.expect(AsymmetricAssertion.isAsymmetricAssertion(anythingAssertion)).toBe(true)
        selfTestsRunner.expect(AsymmetricAssertion.isAsymmetricAssertion(regularObject)).toBe(false)
        selfTestsRunner.expect(AsymmetricAssertion.isAsymmetricAssertion(null)).toBe(false)
        selfTestsRunner.expect(AsymmetricAssertion.isAsymmetricAssertion(undefined)).toBe(false)
      })

      selfTestsRunner.test('should throw error for base AsymmetricAssertion assert method', () => {
        const baseAssertion = new AsymmetricAssertion()

        // The base class assert method should throw "Not implemented" error
        selfTestsRunner.expect(() => baseAssertion.assert('any value')).toThrow('Not implemented')
      })

      selfTestsRunner.test('should handle asymmetric assertions that do not match', () => {
        const greaterThanAssertion = new GreaterThanAssertion(10)
        const result1 = diff(greaterThanAssertion, 15)
        const result2 = diff(greaterThanAssertion, 5)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: 15, same: true })
        selfTestsRunner.expect(result2.type).toBe('different')
        selfTestsRunner.expect((result2 as any).expected).toBe(greaterThanAssertion)
        selfTestsRunner.expect((result2 as any).actual).toBe(5)
        selfTestsRunner.expect(result2.same).toBe(false)
      })

      selfTestsRunner.test('should handle contain assertions', () => {
        const containAssertion = new ContainAssertion('test')
        const result1 = diff(containAssertion, ['test', 'other'])
        const result2 = diff(containAssertion, ['other', 'values'])

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: ['test', 'other'], same: true })
        selfTestsRunner.expect(result2.type).toBe('different')
        selfTestsRunner.expect((result2 as any).expected).toBe(containAssertion)
        selfTestsRunner.expect((result2 as any).actual).toEqual(['other', 'values'])
        selfTestsRunner.expect(result2.same).toBe(false)
      })

      selfTestsRunner.test('should handle asymmetric assertions in nested structures', () => {
        const anythingAssertion = new AnythingAssertion()
        const expected = { id: 1, data: anythingAssertion }
        const actual = { id: 1, data: { complex: 'object' } }

        const result = diff(expected, actual)

        selfTestsRunner.expect(result.same).toBe(true)
        selfTestsRunner.expect(result.type).toBe('object')
      })
    })

    selfTestsRunner.describe('complex structures', () => {
      selfTestsRunner.test('should handle mixed array and object structures', () => {
        const expected = {
          users: [
            { id: 1, name: 'John', tags: ['admin', 'user'] },
            { id: 2, name: 'Jane', tags: ['user'] }
          ],
          meta: { count: 2, timestamp: 12345 }
        }
        const actual = {
          users: [
            { id: 1, name: 'John', tags: ['admin', 'user'] },
            { id: 2, name: 'Jane', tags: ['user'] }
          ],
          meta: { count: 2, timestamp: 12345 }
        }

        const result = diff(expected, actual)

        selfTestsRunner.expect(result.same).toBe(true)
        selfTestsRunner.expect(result.type).toBe('object')
      })

      selfTestsRunner.test('should handle complex differences', () => {
        const expected = {
          users: [
            { id: 1, name: 'John', active: true },
            { id: 2, name: 'Jane', active: false }
          ]
        }
        const actual = {
          users: [
            { id: 1, name: 'John', active: true },
            { id: 2, name: 'Jane', active: true },
            { id: 3, name: 'Bob', active: true }
          ]
        }

        const result = diff(expected, actual)

        selfTestsRunner.expect(result.same).toBe(false)
        selfTestsRunner.expect(result.type).toBe('object')

        // Check that the structure contains the differences
        const usersDiff = (result as any).keys.users
        selfTestsRunner.expect(usersDiff.same).toBe(false)
        selfTestsRunner.expect(usersDiff.type).toBe('array')
      })
    })

    selfTestsRunner.describe('edge cases', () => {
      selfTestsRunner.test('should handle functions', () => {
        const fn1 = () => 'test'
        const fn2 = () => 'test'
        const fn3 = fn1

        const result1 = diff(fn1, fn2)
        const result2 = diff(fn1, fn3)
        const result3 = diff(fn1, 'not a function')

        selfTestsRunner.expect(result1).toEqual({ type: 'different', expected: fn1, actual: fn2, same: false })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: fn1, same: true })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: fn1, actual: 'not a function', same: false })
      })

      selfTestsRunner.test('should handle dates', () => {
        const date1 = new Date('2023-01-01')
        const date2 = new Date('2023-01-01')
        const date3 = new Date('2023-01-02')

        const result1 = diff(date1, date2)
        const result2 = diff(date1, date3)

        // Dates are objects with the same structure, so they compare as same when equal
        selfTestsRunner.expect(result1.type).toBe('object')
        selfTestsRunner.expect(result1.same).toBe(true)

        // Different dates will still have the same object structure (both empty)
        // since Date objects don't have enumerable properties
        selfTestsRunner.expect(result2.type).toBe('object')
        selfTestsRunner.expect(result2.same).toBe(true)
      })

      selfTestsRunner.test('should handle regular expressions', () => {
        const regex1 = /test/g
        const regex2 = /test/g
        const regex3 = regex1

        const result1 = diff(regex1, regex2)
        const result2 = diff(regex1, regex3)

        // RegExp objects are compared as objects, and have the same structure when equal
        selfTestsRunner.expect(result1.type).toBe('object')
        selfTestsRunner.expect(result1.same).toBe(true)

        // Same reference should be the same
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: regex1, same: true })
      })

      selfTestsRunner.test('should handle symbols', () => {
        const sym1 = Symbol('test')
        const sym2 = Symbol('test')
        const sym3 = sym1

        const result1 = diff(sym1, sym2)
        const result2 = diff(sym1, sym3)

        selfTestsRunner.expect(result1).toEqual({ type: 'different', expected: sym1, actual: sym2, same: false })
        selfTestsRunner.expect(result2).toEqual({ type: 'same', value: sym1, same: true })
      })

      selfTestsRunner.test('should handle BigInt values', () => {
        const big1 = BigInt(123)
        const big2 = BigInt(123)
        const big3 = BigInt(456)

        const result1 = diff(big1, big2)
        const result2 = diff(big1, big3)
        const result3 = diff(big1, 123)

        selfTestsRunner.expect(result1).toEqual({ type: 'same', value: big1, same: true })
        selfTestsRunner.expect(result2).toEqual({ type: 'different', expected: big1, actual: big3, same: false })
        selfTestsRunner.expect(result3).toEqual({ type: 'different', expected: big1, actual: 123, same: false })
      })

      selfTestsRunner.test('should handle empty and sparse arrays', () => {
        const sparse1 = [1, , 3] // eslint-disable-line no-sparse-arrays
        const sparse2 = [1, , 3] // eslint-disable-line no-sparse-arrays
        const dense = [1, undefined, 3]

        const result1 = diff(sparse1, sparse2)
        const result2 = diff(sparse1, dense)

        selfTestsRunner.expect(result1.same).toBe(true)
        // Sparse arrays actually compare the same as dense arrays with undefined
        // because the missing elements are effectively undefined
        selfTestsRunner.expect(result2.same).toBe(true)
      })

      selfTestsRunner.test('should handle objects with prototype methods', () => {
        class TestClass {
          value: number
          constructor(value: number) {
            this.value = value
          }
          getValue() {
            return this.value
          }
        }

        const obj1 = new TestClass(42)
        const obj2 = new TestClass(42)
        const obj3 = new TestClass(43)

        const result1 = diff(obj1, obj2)
        const result2 = diff(obj1, obj3)

        selfTestsRunner.expect(result1.same).toBe(true)
        selfTestsRunner.expect(result2.same).toBe(false)
      })

      selfTestsRunner.test('should handle very deep nesting', () => {
        let deep1: any = { value: 'leaf' }
        let deep2: any = { value: 'leaf' }

        // Create deep nesting
        for (let i = 0; i < 10; i++) {
          deep1 = { nested: deep1 }
          deep2 = { nested: deep2 }
        }

        const result = diff(deep1, deep2)
        selfTestsRunner.expect(result.same).toBe(true)

        // Change the leaf value
        let current = deep2
        for (let i = 0; i < 10; i++) {
          current = current.nested
        }
        current.value = 'different'

        const result2 = diff(deep1, deep2)
        selfTestsRunner.expect(result2.same).toBe(false)
      })
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
