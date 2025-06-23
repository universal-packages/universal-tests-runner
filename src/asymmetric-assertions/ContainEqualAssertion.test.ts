import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function containEqualAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('ContainEqualAssertion test', () => {
    selfTestsRunner.test('Should match arrays containing equal values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array contain equal test', async () => {
        // Test with arrays containing equal primitive values
        testsRunner.expect([1, 2, 3, 4]).toEqual(testsRunner.expectContainEqual(3))
        testsRunner.expect(['a', 'b', 'c']).toEqual(testsRunner.expectContainEqual('b'))
        testsRunner.expect([true, false, true]).toEqual(testsRunner.expectContainEqual(false))
        testsRunner.expect([1, '2', 3]).toEqual(testsRunner.expectContainEqual('2'))
        testsRunner.expect([null, undefined, 0]).toEqual(testsRunner.expectContainEqual(null))
        testsRunner.expect([null, undefined, 0]).toEqual(testsRunner.expectContainEqual(undefined))

        // Test with objects (deep equality, not reference equality)
        const obj1 = { name: 'Alice', age: 25 }
        const obj2 = { name: 'Bob', age: 30 }
        const obj3 = { name: 'Alice', age: 25 } // Same content as obj1

        testsRunner.expect([obj1, obj2]).toEqual(testsRunner.expectContainEqual({ name: 'Alice', age: 25 }))
        testsRunner.expect([obj1, obj2]).toEqual(testsRunner.expectContainEqual(obj3)) // Deep equality
        testsRunner.expect([obj1, obj2]).toEqual(testsRunner.expectContainEqual({ name: 'Bob', age: 30 }))

        // Test with nested objects
        const nestedObj = {
          user: { name: 'Charlie', profile: { active: true, role: 'admin' } },
          timestamp: 123456
        }

        testsRunner.expect([nestedObj, { other: 'data' }]).toEqual(
          testsRunner.expectContainEqual({
            user: { name: 'Charlie', profile: { active: true, role: 'admin' } },
            timestamp: 123456
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match arrays without equal values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array not contain equal test', async () => {
        // Test with arrays not containing the value
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.expectContainEqual(4))
        testsRunner.expect(['a', 'b', 'c']).not.toEqual(testsRunner.expectContainEqual('d'))
        testsRunner.expect([true, true]).not.toEqual(testsRunner.expectContainEqual(false))
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.expectContainEqual('3')) // Type difference

        // Test with objects that don't match deeply
        const obj1 = { name: 'Alice', age: 25 }
        const obj2 = { name: 'Bob', age: 30 }

        testsRunner.expect([obj1, obj2]).not.toEqual(testsRunner.expectContainEqual({ name: 'Alice', age: 26 })) // Different age
        testsRunner.expect([obj1, obj2]).not.toEqual(testsRunner.expectContainEqual({ name: 'Charlie', age: 25 })) // Different name
        testsRunner.expect([obj1, obj2]).not.toEqual(testsRunner.expectContainEqual({ name: 'Alice' })) // Missing property

        // Empty array
        testsRunner.expect([]).not.toEqual(testsRunner.expectContainEqual(1))
        testsRunner.expect([]).not.toEqual(testsRunner.expectContainEqual('anything'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-array values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-array containment test', async () => {
        // Strings should not work with containment (only arrays are supported)
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContainEqual('h'))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContainEqual('e'))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContainEqual('o'))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContainEqual('x'))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContainEqual('H'))

        // Objects should not match expectContainEqual directly
        testsRunner.expect({ a: 1, b: 2 }).not.toEqual(testsRunner.expectContainEqual(1))
        testsRunner.expect({ a: 1, b: 2 }).not.toEqual(testsRunner.expectContainEqual('a'))

        // Other types should not match
        testsRunner.expect(123).not.toEqual(testsRunner.expectContainEqual(1))
        testsRunner.expect(true).not.toEqual(testsRunner.expectContainEqual(true))
        testsRunner.expect(null).not.toEqual(testsRunner.expectContainEqual(null))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectContainEqual(undefined))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated contain equal test', async () => {
        // Arrays without the value should match not.expectContainEqual()
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.not.expectContainEqual(4))
        testsRunner.expect(['a', 'b']).toEqual(testsRunner.not.expectContainEqual('c'))
        testsRunner.expect([]).toEqual(testsRunner.not.expectContainEqual('anything'))

        // Arrays with the value should not match not.expectContainEqual()
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.not.expectContainEqual(2))
        testsRunner.expect(['a', 'b', 'c']).not.toEqual(testsRunner.not.expectContainEqual('b'))

        // Object deep equality in negation
        const obj = { name: 'Alice', age: 25 }
        testsRunner.expect([obj]).not.toEqual(testsRunner.not.expectContainEqual({ name: 'Alice', age: 25 }))
        testsRunner.expect([obj]).toEqual(testsRunner.not.expectContainEqual({ name: 'Bob', age: 25 }))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectContainEqual', async () => {
        const shoppingCart = {
          items: [
            { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' },
            { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics' },
            { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics' }
          ],
          discounts: ['STUDENT10', 'FREESHIP', 'WELCOME5'],
          metadata: {
            created: new Date('2023-01-01'),
            updated: new Date('2023-01-02'),
            tags: ['electronics', 'workspace', 'productivity']
          }
        }

        // Test that specific items exist in the cart using deep equality
        testsRunner.expect(shoppingCart).toMatchObject({
          items: testsRunner.expectContainEqual({ id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' }),
          discounts: testsRunner.expectContainEqual('STUDENT10'),
          metadata: {
            tags: testsRunner.expectContainEqual('workspace')
          }
        })

        // Test searching for partial matches shouldn't work (must be exact deep equality)
        testsRunner.expect(shoppingCart).not.toMatchObject({
          items: testsRunner.expectContainEqual({ id: 1, name: 'Laptop' }) // Missing price and category
        })

        // Test with blog posts that might have similar but not identical content
        const blogPosts = [
          {
            title: 'Getting Started with React',
            author: 'John Doe',
            tags: ['react', 'javascript', 'frontend'],
            published: true,
            views: 1250
          },
          {
            title: 'Advanced TypeScript Tips',
            author: 'Jane Smith',
            tags: ['typescript', 'javascript', 'tips'],
            published: true,
            views: 890
          },
          {
            title: 'Node.js Best Practices',
            author: 'John Doe',
            tags: ['nodejs', 'javascript', 'backend'],
            published: false,
            views: 0
          }
        ]

        // Should find posts with exact matching properties
        testsRunner.expect(blogPosts).toEqual(
          testsRunner.expectContainEqual({
            title: 'Getting Started with React',
            author: 'John Doe',
            tags: ['react', 'javascript', 'frontend'],
            published: true,
            views: 1250
          })
        )

        // Should not find posts with slightly different properties
        testsRunner.expect(blogPosts).not.toEqual(
          testsRunner.expectContainEqual({
            title: 'Getting Started with React',
            author: 'John Doe',
            tags: ['react', 'javascript', 'frontend'],
            published: true,
            views: 1251 // Different view count
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with special values
        testsRunner.expect([NaN, 1, 2]).toEqual(testsRunner.expectContainEqual(NaN))
        testsRunner.expect([Infinity, -Infinity, 0]).toEqual(testsRunner.expectContainEqual(Infinity))
        testsRunner.expect([Infinity, -Infinity, 0]).toEqual(testsRunner.expectContainEqual(-Infinity))

        // Test with mixed types
        testsRunner.expect([1, '1', true, null]).toEqual(testsRunner.expectContainEqual(1))
        testsRunner.expect([1, '1', true, null]).toEqual(testsRunner.expectContainEqual('1'))
        testsRunner.expect([1, '1', true, null]).toEqual(testsRunner.expectContainEqual(true))
        testsRunner.expect([1, '1', true, null]).toEqual(testsRunner.expectContainEqual(null))
        testsRunner.expect([1, '1', true, null]).not.toEqual(testsRunner.expectContainEqual(undefined))

        // Test with arrays containing arrays (nested structure)
        const nestedArray = [
          [1, 2],
          [3, 4],
          [5, 6]
        ]
        testsRunner.expect(nestedArray).toEqual(testsRunner.expectContainEqual([3, 4]))
        testsRunner.expect(nestedArray).not.toEqual(testsRunner.expectContainEqual([3, 5])) // Different array

        // Test with objects containing circular references (should handle gracefully)
        const circularObj: any = { name: 'test' }
        circularObj.self = circularObj
        const arrayWithCircular = [{ name: 'other' }, circularObj]

        // This should work for the non-circular object
        testsRunner.expect(arrayWithCircular).toEqual(testsRunner.expectContainEqual({ name: 'other' }))

        // Test with functions (should work with reference equality for functions)
        const func1 = () => 'hello'
        const func2 = () => 'world'
        const func3 = func1 // Same reference

        testsRunner.expect([func1, func2]).toEqual(testsRunner.expectContainEqual(func1))
        testsRunner.expect([func1, func2]).toEqual(testsRunner.expectContainEqual(func3)) // Same reference
        testsRunner.expect([func1, func2]).not.toEqual(testsRunner.expectContainEqual(() => 'hello')) // Different reference

        // Test with symbols
        const sym1 = Symbol('test')
        const sym2 = Symbol('test') // Different symbol even with same description
        const sym3 = sym1 // Same reference

        testsRunner.expect([sym1, 'other']).toEqual(testsRunner.expectContainEqual(sym1))
        testsRunner.expect([sym1, 'other']).toEqual(testsRunner.expectContainEqual(sym3)) // Same reference
        testsRunner.expect([sym1, 'other']).not.toEqual(testsRunner.expectContainEqual(sym2)) // Different symbol
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
