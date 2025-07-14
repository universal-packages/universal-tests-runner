import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toContainTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toContain assertion test', () => {
    selfTestsRunner.test('Should pass when array contains expected item', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array contains test', async () => {
        testsRunner.expect([1, 2, 3]).toContain(2)
        testsRunner.expect(['a', 'b', 'c']).toContain('b')
        testsRunner.expect([true, false]).toContain(true)
        testsRunner.expect([null, undefined]).toContain(null)
        testsRunner.expect([1, 'hello', true]).toContain('hello')

        // Object references
        const obj = { name: 'test' }
        testsRunner.expect([obj, 'other']).toContain(obj)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when string contains expected substring', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String contains test', async () => {
        testsRunner.expect('hello world').toContain('world')
        testsRunner.expect('hello world').toContain('hello')
        testsRunner.expect('hello world').toContain('o w')
        testsRunner.expect('hello world').toContain('') // Empty string is in every string
        testsRunner.expect('JavaScript').toContain('Script')
        testsRunner.expect('🌟⭐').toContain('⭐')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when array does not contain expected item', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array does not contain test', async () => {
        testsRunner.expect([1, 2, 3]).toContain(4)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to contain {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '4'
        },
        actual: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should fail when string does not contain expected substring', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String does not contain test', async () => {
        testsRunner.expect('hello world').toContain('xyz')
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to contain {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'string',
          representation: "'xyz'"
        },
        actual: {
          type: 'string',
          representation: "'hello world'"
        }
      })
    })

    selfTestsRunner.test('Should handle object equality correctly in arrays', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object equality test', async () => {
        const obj1 = { name: 'test' }
        const obj2 = { name: 'test' } // Different reference, same content

        testsRunner.expect([obj1]).toContain(obj1) // Same reference - should pass
        testsRunner.expect([obj1]).not.toContain(obj2) // Different reference - should fail
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should throw error when container is not array or string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Invalid container test', async () => {
        testsRunner.expect(42).toContain(4)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expectation {{actual}} is not a string or array')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'number',
          representation: '42'
        }
      })
    })

    selfTestsRunner.test('Should handle different invalid container types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toContain('test')
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toContain('key')
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toContain('value')
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail with invalid container error
      tests.forEach((test) => {
        const error = test.failureReason as TestError
        selfTestsRunner.expect(error.message).toBe('Expectation {{actual}} is not a string or array')
      })
    })

    selfTestsRunner.test('Should work with not.toContain for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toContain test', async () => {
        testsRunner.expect([1, 2, 3]).not.toContain(4)
        testsRunner.expect('hello world').not.toContain('xyz')
        testsRunner.expect(['a', 'b']).not.toContain('c')
        testsRunner.expect('JavaScript').not.toContain('Python')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toContain when item is contained', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toContain test', async () => {
        testsRunner.expect([1, 2, 3]).not.toContain(2)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to contain {{target}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '2'
        },
        actual: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Empty containers
        testsRunner.expect([]).not.toContain('anything')
        testsRunner.expect('').toContain('') // Empty string contains empty string
        testsRunner.expect('').not.toContain('a')

        // Special values - NaN handling in arrays might use indexOf which returns false for NaN
        // So this might actually fail - let's test what the implementation does
        testsRunner.expect([NaN]).not.toContain(NaN) // NaN !== NaN in indexOf
        testsRunner.expect([0, -0]).toContain(0)
        testsRunner.expect([0, -0]).toContain(-0)

        // Nested arrays
        const nestedArray = [
          [1, 2],
          [3, 4]
        ]
        const subArray = [1, 2]
        testsRunner.expect(nestedArray).not.toContain(subArray) // Different reference

        // Case sensitivity
        testsRunner.expect('Hello World').not.toContain('hello') // Case sensitive
        testsRunner.expect('Hello World').toContain('Hello')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle array-like objects differently from arrays', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array-like objects test', async () => {
        const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 }

        // Array-like objects are not arrays, so should fail
        testsRunner
          .expect(() => {
            testsRunner.expect(arrayLike).toContain('b')
          })
          .toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle unicode and special characters', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Unicode test', async () => {
        testsRunner.expect('café').toContain('é')
        testsRunner.expect('🌟⭐🎉').toContain('⭐')
        testsRunner.expect(['🌟', '⭐', '🎉']).toContain('⭐')
        testsRunner.expect('Hello\nWorld').toContain('\n')
        testsRunner.expect('Hello\tWorld').toContain('\t')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
