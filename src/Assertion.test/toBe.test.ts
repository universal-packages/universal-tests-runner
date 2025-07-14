import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBe assertion test', () => {
    selfTestsRunner.test('Should access toBe through TestsRunner expect method', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Basic toBe access test', async () => {
        // Test that expect returns an Assertion instance with toBe method
        const assertion = testsRunner.expect(42)
        selfTestsRunner.expect(typeof assertion.toBe).toBe('function')

        // Test basic toBe functionality
        assertion.toBe(42) // Should not throw

        // Test that we can chain with not
        selfTestsRunner.expect(typeof assertion.not.toBe).toBe('function')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when values are strictly equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Primitive equality test', async () => {
        testsRunner.expect(42).toBe(42)
        testsRunner.expect('hello').toBe('hello')
        testsRunner.expect(true).toBe(true)
        testsRunner.expect(false).toBe(false)
        testsRunner.expect(null).toBe(null)
        testsRunner.expect(undefined).toBe(undefined)
      })

      testsRunner.test('Object reference equality test', async () => {
        const obj = { a: 1 }
        const arr = [1, 2, 3]
        const func = () => {}

        testsRunner.expect(obj).toBe(obj)
        testsRunner.expect(arr).toBe(arr)
        testsRunner.expect(func).toBe(func)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when values are not strictly equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing toBe test', async () => {
        testsRunner.expect(42).toBe(43)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const failedTest = testsRunner.state.tests.find((t) => t.name === 'Failing toBe test')
      selfTestsRunner.expect(failedTest?.status).toBe('failed')
      selfTestsRunner.expect(failedTest?.failureReason).toBeInstanceOf(TestError)
    })

    selfTestsRunner.test('Should handle TestError details for basic mismatch', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('TestError details test', async () => {
        testsRunner.expect(42).toBe(43)
      })

      await testsRunner.run()

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError

      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '43'
        },
        actual: {
          type: 'number',
          representation: '42'
        }
      })
    })

    selfTestsRunner.test('Should handle different primitive types in error messages', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String mismatch', async () => {
        testsRunner.expect('hello').toBe('world')
      })

      testsRunner.test('Boolean mismatch', async () => {
        testsRunner.expect(true).toBe(false)
      })

      testsRunner.test('Null vs undefined', async () => {
        testsRunner.expect(null).toBe(undefined)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // String test
      const stringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals).toEqual({
        target: {
          type: 'string',
          representation: "'world'"
        },
        actual: {
          type: 'string',
          representation: "'hello'"
        }
      })

      // Boolean test
      const boolError = tests[1].failureReason as TestError
      selfTestsRunner.expect(boolError.messageLocals).toEqual({
        target: {
          type: 'boolean',
          representation: 'false'
        },
        actual: {
          type: 'boolean',
          representation: 'true'
        }
      })

      // Null vs undefined test
      const nullError = tests[2].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals).toEqual({
        target: {
          type: 'undefined',
          representation: 'undefined'
        },
        actual: {
          type: 'null',
          representation: 'null'
        }
      })
    })

    selfTestsRunner.test('Should handle object/array message locals', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object mismatch', async () => {
        testsRunner.expect({ a: 1 }).toBe({ a: 2 })
      })

      testsRunner.test('Array mismatch', async () => {
        testsRunner.expect([1, 2]).toBe([3, 4])
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Object test
      const objError = tests[0].failureReason as TestError
      selfTestsRunner.expect(objError.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'Object'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })

      // Array test
      const arrError = tests[1].failureReason as TestError
      selfTestsRunner.expect(arrError.messageLocals).toEqual({
        target: {
          type: 'array',
          representation: '[Array]'
        },
        actual: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should work with not.toBe for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBe test', async () => {
        testsRunner.expect(42).not.toBe(43)
        testsRunner.expect('hello').not.toBe('world')
        testsRunner.expect(true).not.toBe(false)
        testsRunner.expect({ a: 1 }).not.toBe({ a: 1 }) // Different objects
        testsRunner.expect([1]).not.toBe([1]) // Different arrays
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBe when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBe test', async () => {
        testsRunner.expect(42).not.toBe(42)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError

      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be {{target}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '42'
        },
        actual: {
          type: 'number',
          representation: '42'
        }
      })
    })

    selfTestsRunner.test('Should handle not.toBe with different types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String not.toBe failure', async () => {
        testsRunner.expect('test').not.toBe('test')
      })

      testsRunner.test('Object reference not.toBe failure', async () => {
        const obj = { a: 1 }
        testsRunner.expect(obj).not.toBe(obj)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // String test
      const stringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals).toEqual({
        target: {
          type: 'string',
          representation: "'test'"
        },
        actual: {
          type: 'string',
          representation: "'test'"
        }
      })

      // Object test
      const objError = tests[1].failureReason as TestError
      selfTestsRunner.expect(objError.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'Object'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should handle special values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Special values toBe test', async () => {
        testsRunner.expect(NaN).toBe(NaN) // NaN === NaN is false, so this should fail
      })

      testsRunner.test('Zero comparison test', async () => {
        testsRunner.expect(0).toBe(-0) // 0 === -0 is true
        testsRunner.expect(-0).toBe(0) // -0 === 0 is true
      })

      await testsRunner.run()

      // NaN test should fail because NaN !== NaN
      const nanTest = testsRunner.state.tests.find((t) => t.name === 'Special values toBe test')
      selfTestsRunner.expect(nanTest?.status).toBe('failed')

      // Zero test should pass because 0 === -0
      const zeroTest = testsRunner.state.tests.find((t) => t.name === 'Zero comparison test')
      selfTestsRunner.expect(zeroTest?.status).toBe('succeeded')
    })

    selfTestsRunner.test('Should handle function comparisons', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function equality test', async () => {
        const func1 = () => 'hello'
        const func2 = () => 'hello'

        testsRunner.expect(func1).toBe(func1) // Same reference
        testsRunner.expect(func1).not.toBe(func2) // Different references
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle complex nested test scenarios', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.describe('Nested toBe tests', () => {
        testsRunner.test('Should pass nested toBe', async () => {
          testsRunner.expect(1).toBe(1)
        })

        testsRunner.test('Should fail nested toBe', async () => {
          testsRunner.expect(1).toBe(2)
        })
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests
      selfTestsRunner.expect(tests).toHaveLength(2)
      selfTestsRunner.expect(tests[0].status).toBe('succeeded')
      selfTestsRunner.expect(tests[1].status).toBe('failed')

      // Check the failed test error
      const failedError = tests[1].failureReason as TestError
      selfTestsRunner.expect(failedError.message).toBe('Expected {{actual}} to be {{target}}')
    })

    selfTestsRunner.test('Should handle toBe with asymmetric assertions', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Asymmetric assertion test', async () => {
        // Test with expectAnything - should pass
        testsRunner.expect(42).toBe(testsRunner.expectAnything())
        testsRunner.expect('hello').toBe(testsRunner.expectAnything())
        testsRunner.expect(null).toBe(testsRunner.expectAnything())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle toBe with asymmetric assertions negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Asymmetric assertion negation test', async () => {
        // Test with not.expectAnything - should fail
        testsRunner.expect(42).not.toBe(testsRunner.expectAnything())
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError

      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be {{target}}, but it was')
      selfTestsRunner.expect(error.messageLocals.target).toEqual({
        type: 'asymmetric-assertion',
        representation: 'AnythingAssertion'
      })
      selfTestsRunner.expect(error.messageLocals.actual).toEqual({
        type: 'number',
        representation: '42'
      })
    })

    selfTestsRunner.test('Should preserve error stack traces', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Stack trace test', async () => {
        testsRunner.expect(1).toBe(2)
      })

      await testsRunner.run()

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError

      selfTestsRunner.expect(error.stack).toBeDefined()
      selfTestsRunner.expect(typeof error.stack).toBe('string')
      selfTestsRunner.expect(error.stack!.length).toBeGreaterThan(0)
    })

    selfTestsRunner.test('Should handle multiple toBe assertions in single test', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Multiple assertions test', async () => {
        testsRunner.expect(1).toBe(1)
        testsRunner.expect(2).toBe(2)
        testsRunner.expect(3).toBe(4) // This will fail
        testsRunner.expect(5).toBe(5) // This won't be reached
      })

      await testsRunner.run()

      const failedTest = testsRunner.state.tests[0]
      selfTestsRunner.expect(failedTest.status).toBe('failed')

      const error = failedTest.failureReason as TestError
    })

    selfTestsRunner.test('Should handle edge cases with message formatting', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Empty string test', async () => {
        testsRunner.expect('').toBe('not empty')
      })

      testsRunner.test('Symbol test', async () => {
        const sym1 = Symbol('test')
        const sym2 = Symbol('test')
        testsRunner.expect(sym1).toBe(sym2)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Empty string test
      const emptyStringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(emptyStringError.messageLocals.actual.representation).toBe("''")
      selfTestsRunner.expect(emptyStringError.messageLocals.target.representation).toBe("'not empty'")

      // Symbol test
      const symbolError = tests[1].failureReason as TestError
      selfTestsRunner.expect(symbolError.messageLocals.actual.representation).toBe('Symbol(test)')
      selfTestsRunner.expect(symbolError.messageLocals.target.representation).toBe('Symbol(test)')
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
