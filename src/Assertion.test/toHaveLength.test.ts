import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveLengthTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveLength assertion test', () => {
    selfTestsRunner.test('Should pass when array has expected length', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array length test', async () => {
        testsRunner.expect([]).toHaveLength(0)
        testsRunner.expect([1]).toHaveLength(1)
        testsRunner.expect([1, 2, 3]).toHaveLength(3)
        testsRunner.expect(['a', 'b', 'c', 'd', 'e']).toHaveLength(5)
        testsRunner.expect(new Array(10)).toHaveLength(10)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when string has expected length', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String length test', async () => {
        testsRunner.expect('').toHaveLength(0)
        testsRunner.expect('a').toHaveLength(1)
        testsRunner.expect('hello').toHaveLength(5)
        testsRunner.expect('hello world').toHaveLength(11)
        testsRunner.expect('🌟').toHaveLength(2) // Emoji can be 2 characters
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with objects that have length property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object with length test', async () => {
        const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 }
        const customObj = { length: 42 }

        testsRunner.expect(arrayLike).toHaveLength(3)
        testsRunner.expect(customObj).toHaveLength(42)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when length does not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Wrong length test', async () => {
        testsRunner.expect([1, 2, 3]).toHaveLength(5)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have length {{expected}}, but got length {{actualLength}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: '5',
        actual: 'Array',
        actualLength: '3'
      })
      selfTestsRunner.expect(error.expected).toBe(5)
      selfTestsRunner.expect(error.actual).toBe(3) // The actual value is the actual length, not the array
    })

    selfTestsRunner.test('Should throw error when value has no length property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No length property test', async () => {
        testsRunner.expect({}).toHaveLength(0)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to have a length, but it does not')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.expected).toBe('value with length property')
      selfTestsRunner.expect(error.actual).toEqual({})
    })

    selfTestsRunner.test('Should handle different types without length property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Number test', async () => {
        testsRunner.expect(42).toHaveLength(2)
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toHaveLength(0)
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toHaveLength(0)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Number test should fail with the expected error message
      const numberTest = tests[0]
      const numberError = numberTest.failureReason as TestError
      selfTestsRunner.expect(numberError.message).toBe('Expected value to have a length, but it does not')

      // Null and undefined tests should fail with runtime errors since accessing .length on them throws
      const nullTest = tests[1]
      const nullError = nullTest.failureReason as Error
      selfTestsRunner.expect(nullError.message).toBe("Cannot read properties of null (reading 'length')")

      const undefinedTest = tests[2]
      const undefinedError = undefinedTest.failureReason as Error
      selfTestsRunner.expect(undefinedError.message).toBe("Cannot read properties of undefined (reading 'length')")
    })

    selfTestsRunner.test('Should work with not.toHaveLength for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveLength test', async () => {
        testsRunner.expect([1, 2, 3]).not.toHaveLength(5)
        testsRunner.expect('hello').not.toHaveLength(10)
        testsRunner.expect([]).not.toHaveLength(1)
        testsRunner.expect('').not.toHaveLength(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveLength when length matches', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveLength test', async () => {
        testsRunner.expect([1, 2, 3]).not.toHaveLength(3)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have length {{expected}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: '3',
        actual: 'Array'
      })
      selfTestsRunner.expect(error.expected).toBe(3)
      selfTestsRunner.expect(error.actual).toBe(3) // The actual value is the actual length
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Sparse arrays
        const sparseArray = new Array(5)
        testsRunner.expect(sparseArray).toHaveLength(5)

        // Array with holes
        const holeyArray = [1, , , 4] // [1, undefined, undefined, 4]
        testsRunner.expect(holeyArray).toHaveLength(4)

        // Very long string
        const longString = 'a'.repeat(1000)
        testsRunner.expect(longString).toHaveLength(1000)

        // Object with non-numeric length (should still work as it's just property access)
        const weirdObj = { length: 5 }
        testsRunner.expect(weirdObj).toHaveLength(5)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with Set and Map (they have size, not length)', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Set test', async () => {
        const mySet = new Set([1, 2, 3])
        // This should fail because Set doesn't have length property
        testsRunner.expect(mySet).toHaveLength(3)
      })

      testsRunner.test('Map test', async () => {
        const myMap = new Map([
          ['a', 1],
          ['b', 2]
        ])
        // This should fail because Map doesn't have length property
        testsRunner.expect(myMap).toHaveLength(2)
      })

      await testsRunner.run()

      // Both tests should fail because Set/Map don't have length property
      const tests = testsRunner.state.tests
      tests.forEach((test) => {
        const error = test.failureReason as TestError
        selfTestsRunner.expect(error.message).toBe('Expected value to have a length, but it does not')
      })
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
