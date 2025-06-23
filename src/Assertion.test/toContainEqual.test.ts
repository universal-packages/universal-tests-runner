import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toContainEqualTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toContainEqual assertion test', () => {
    selfTestsRunner.test('Should pass when array contains item with deep equality', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Deep equality contains test', async () => {
        // Objects with same content but different references
        testsRunner.expect([{ name: 'John' }, { name: 'Jane' }]).toContainEqual({ name: 'John' })
        testsRunner.expect([{ a: 1, b: 2 }, { c: 3 }]).toContainEqual({ a: 1, b: 2 })

        // Arrays with same content
        testsRunner
          .expect([
            [1, 2],
            [3, 4]
          ])
          .toContainEqual([1, 2])
        testsRunner
          .expect([
            ['a', 'b'],
            ['c', 'd']
          ])
          .toContainEqual(['a', 'b'])

        // Primitives (should work like toContain)
        testsRunner.expect([1, 2, 3]).toContainEqual(2)
        testsRunner.expect(['a', 'b', 'c']).toContainEqual('b')

        // Complex nested structures
        testsRunner
          .expect([
            { user: { name: 'John', age: 30 }, active: true },
            { user: { name: 'Jane', age: 25 }, active: false }
          ])
          .toContainEqual({ user: { name: 'John', age: 30 }, active: true })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when array does not contain item with deep equality', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Deep equality does not contain test', async () => {
        testsRunner.expect([{ name: 'John' }, { name: 'Jane' }]).toContainEqual({ name: 'Bob' })
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to contain an item equal to {{expected}}, but it did not')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Object',
        actual: 'Array'
      })
      selfTestsRunner.expect(error.expected).toEqual({ name: 'Bob' })
    })

    selfTestsRunner.test('Should handle partial vs complete object matching', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Partial object matching test', async () => {
        const fullObject = { name: 'John', age: 30, city: 'New York' }
        const partialObject = { name: 'John', age: 30 }

        testsRunner.expect([fullObject]).toContainEqual(fullObject) // Exact match
        testsRunner.expect([fullObject]).not.toContainEqual(partialObject) // Partial should not match
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should throw error when container is not an array', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Invalid container test', async () => {
        testsRunner.expect('hello world').toContainEqual('world')
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected an array, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: 'hello world'
      })
      selfTestsRunner.expect(error.expected).toBe('array')
      selfTestsRunner.expect(error.actual).toBe('hello world')
    })

    selfTestsRunner.test('Should handle different invalid container types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Number test', async () => {
        testsRunner.expect(42).toContainEqual(4)
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toContainEqual('test')
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toContainEqual('key')
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail with invalid container error
      tests.forEach((test) => {
        const error = test.failureReason as TestError
        selfTestsRunner.expect(error.message).toBe('Expected an array, but got {{actual}}')
      })
    })

    selfTestsRunner.test('Should work with not.toContainEqual for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toContainEqual test', async () => {
        testsRunner.expect([{ name: 'John' }]).not.toContainEqual({ name: 'Jane' })
        testsRunner
          .expect([
            [1, 2],
            [3, 4]
          ])
          .not.toContainEqual([5, 6])
        testsRunner.expect([1, 2, 3]).not.toContainEqual(4)

        // Partial objects should not match
        const fullObject = { name: 'John', age: 30, city: 'New York' }
        testsRunner.expect([fullObject]).not.toContainEqual({ name: 'John', age: 30 })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toContainEqual when item is contained', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toContainEqual test', async () => {
        testsRunner.expect([{ name: 'John' }]).not.toContainEqual({ name: 'John' })
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to contain an item equal to {{expected}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Object',
        actual: 'Array'
      })
    })

    selfTestsRunner.test('Should handle edge cases with deep equality', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Empty objects and arrays
        testsRunner.expect([{}]).toContainEqual({})
        testsRunner.expect([[]]).toContainEqual([])

        // NaN handling
        testsRunner.expect([{ value: NaN }]).toContainEqual({ value: NaN })

        // Date objects
        const date1 = new Date('2023-01-01')
        const date2 = new Date('2023-01-01')
        testsRunner.expect([date1]).toContainEqual(date2) // Same time, different instances

        // RegExp objects
        testsRunner.expect([/abc/g]).toContainEqual(/abc/g)

        // Nested structures
        testsRunner.expect([{ users: [{ id: 1, name: 'John' }], meta: { count: 1 } }]).toContainEqual({
          users: [{ id: 1, name: 'John' }],
          meta: { count: 1 }
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should distinguish from toContain reference equality', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Reference vs deep equality test', async () => {
        const obj1 = { name: 'John' }
        const obj2 = { name: 'John' } // Same content, different reference

        // toContain checks reference equality
        testsRunner.expect([obj1]).toContain(obj1) // Same reference
        testsRunner.expect([obj1]).not.toContain(obj2) // Different reference

        // toContainEqual checks deep equality
        testsRunner.expect([obj1]).toContainEqual(obj1) // Same reference
        testsRunner.expect([obj1]).toContainEqual(obj2) // Different reference, same content
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle arrays with mixed types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mixed types test', async () => {
        const mixedArray = [1, 'hello', { name: 'John' }, [1, 2, 3], true, null, undefined]

        testsRunner.expect(mixedArray).toContainEqual(1)
        testsRunner.expect(mixedArray).toContainEqual('hello')
        testsRunner.expect(mixedArray).toContainEqual({ name: 'John' })
        testsRunner.expect(mixedArray).toContainEqual([1, 2, 3])
        testsRunner.expect(mixedArray).toContainEqual(true)
        testsRunner.expect(mixedArray).toContainEqual(null)
        testsRunner.expect(mixedArray).toContainEqual(undefined)

        // Should not contain these
        testsRunner.expect(mixedArray).not.toContainEqual(2)
        testsRunner.expect(mixedArray).not.toContainEqual({ name: 'Jane' })
        testsRunner.expect(mixedArray).not.toContainEqual([1, 2, 4])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
