import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toEqualTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toEqual assertion test', () => {
    selfTestsRunner.test('Should pass when values are deeply equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Deep equality test', async () => {
        // Primitive equality
        testsRunner.expect(42).toEqual(42)
        testsRunner.expect('hello').toEqual('hello')
        testsRunner.expect(true).toEqual(true)
        testsRunner.expect(null).toEqual(null)
        testsRunner.expect(undefined).toEqual(undefined)

        // Object equality (different references, same content)
        testsRunner.expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 })
        testsRunner.expect({ nested: { value: 42 } }).toEqual({ nested: { value: 42 } })

        // Array equality
        testsRunner.expect([1, 2, 3]).toEqual([1, 2, 3])
        testsRunner.expect([{ a: 1 }, { b: 2 }]).toEqual([{ a: 1 }, { b: 2 }])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when values are not deeply equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing toEqual test', async () => {
        testsRunner.expect({ a: 1 }).toEqual({ a: 2 })
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const failedTest = testsRunner.state.tests[0]
      selfTestsRunner.expect(failedTest.status).toBe('failed')
      selfTestsRunner.expect(failedTest.failureReason).toBeInstanceOf(TestError)
    })

    selfTestsRunner.test('Should handle object difference error details', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object difference test', async () => {
        testsRunner.expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 3 })
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected objects to be equal, but they were not')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.difference).toBeDefined()
      selfTestsRunner.expect(error.difference?.type).toBe('object')
    })

    selfTestsRunner.test('Should handle array difference error details', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array difference test', async () => {
        testsRunner.expect([1, 2, 3]).toEqual([1, 2, 4])
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected arrays to be equal, but they were not')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.difference).toBeDefined()
      selfTestsRunner.expect(error.difference?.type).toBe('array')
    })

    selfTestsRunner.test('Should handle primitive difference error details', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Primitive difference test', async () => {
        testsRunner.expect(42).toEqual(43)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{expected}} to equal {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: '43',
        actual: '42'
      })
    })

    selfTestsRunner.test('Should work with not.toEqual for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toEqual test', async () => {
        testsRunner.expect({ a: 1 }).not.toEqual({ a: 2 })
        testsRunner.expect([1, 2]).not.toEqual([1, 3])
        testsRunner.expect(42).not.toEqual(43)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toEqual when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toEqual test', async () => {
        testsRunner.expect({ a: 1 }).not.toEqual({ a: 1 })
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{expected}} not to equal {{actual}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Object',
        actual: 'Object'
      })
    })

    selfTestsRunner.test('Should handle complex nested structures', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex structure test', async () => {
        const complex1 = {
          users: [
            { id: 1, name: 'John', meta: { active: true } },
            { id: 2, name: 'Jane', meta: { active: false } }
          ],
          settings: { theme: 'dark', notifications: true }
        }

        const complex2 = {
          users: [
            { id: 1, name: 'John', meta: { active: true } },
            { id: 2, name: 'Jane', meta: { active: false } }
          ],
          settings: { theme: 'dark', notifications: true }
        }

        testsRunner.expect(complex1).toEqual(complex2)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Empty objects and arrays
        testsRunner.expect({}).toEqual({})
        testsRunner.expect([]).toEqual([])

        // NaN comparison (should be equal in deep comparison)
        testsRunner.expect(NaN).toEqual(NaN)

        // Date objects
        const date1 = new Date('2023-01-01')
        const date2 = new Date('2023-01-01')
        testsRunner.expect(date1).toEqual(date2)

        // RegExp objects
        testsRunner.expect(/abc/g).toEqual(/abc/g)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
