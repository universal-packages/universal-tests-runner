import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeGreaterThanTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeGreaterThan assertion test', () => {
    selfTestsRunner.test('Should pass when value is greater than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Greater than test', async () => {
        testsRunner.expect(5).toBeGreaterThan(3)
        testsRunner.expect(10).toBeGreaterThan(5)
        testsRunner.expect(0).toBeGreaterThan(-1)
        testsRunner.expect(-1).toBeGreaterThan(-5)
        testsRunner.expect(3.14).toBeGreaterThan(3)
        testsRunner.expect(Infinity).toBeGreaterThan(1000)
        testsRunner.expect(1).toBeGreaterThan(-Infinity)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not greater than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not greater than test', async () => {
        testsRunner.expect(3).toBeGreaterThan(5)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be greater than {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '5'
        },
        actual: {
          type: 'number',
          representation: '3'
        }
      })
    })

    selfTestsRunner.test('Should fail when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Equal values test', async () => {
        testsRunner.expect(5).toBeGreaterThan(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be greater than {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '5'
        },
        actual: {
          type: 'number',
          representation: '5'
        }
      })
    })

    selfTestsRunner.test('Should throw error when actual value is not a number', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number actual test', async () => {
        testsRunner.expect('hello').toBeGreaterThan(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a number')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'string',
          representation: "'hello'"
        }
      })
    })

    selfTestsRunner.test('Should handle different non-number types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String test', async () => {
        testsRunner.expect('hello').toBeGreaterThan(5)
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toBeGreaterThan(5)
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toBeGreaterThan(5)
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toBeGreaterThan(5)
      })

      testsRunner.test('Array test', async () => {
        testsRunner.expect([]).toBeGreaterThan(5)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // String test
      const stringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toEqual({
        type: 'string',
        representation: "'hello'"
      })

      // Null test
      const nullError = tests[1].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toEqual({
        type: 'null',
        representation: 'null'
      })

      // Undefined test
      const undefinedError = tests[2].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toEqual({
        type: 'undefined',
        representation: 'undefined'
      })

      // Object test
      const objectError = tests[3].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toEqual({
        type: 'instanceOf',
        representation: 'Object'
      })

      // Array test
      const arrayError = tests[4].failureReason as TestError
      selfTestsRunner.expect(arrayError.messageLocals.actual).toEqual({
        type: 'array',
        representation: '[Array]'
      })
    })

    selfTestsRunner.test('Should work with not.toBeGreaterThan for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeGreaterThan test', async () => {
        testsRunner.expect(3).not.toBeGreaterThan(5)
        testsRunner.expect(5).not.toBeGreaterThan(5) // Equal
        testsRunner.expect(-1).not.toBeGreaterThan(0)
        testsRunner.expect(-Infinity).not.toBeGreaterThan(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeGreaterThan when value is greater', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeGreaterThan test', async () => {
        testsRunner.expect(10).not.toBeGreaterThan(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be greater than {{target}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '5'
        },
        actual: {
          type: 'number',
          representation: '10'
        }
      })
    })

    selfTestsRunner.test('Should handle edge cases with infinity and zero', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        testsRunner.expect(Infinity).toBeGreaterThan(-Infinity)
        testsRunner.expect(1).toBeGreaterThan(-Infinity)
        testsRunner.expect(0).toBeGreaterThan(-0.1)
        testsRunner.expect(0.1).toBeGreaterThan(0)

        // These should fail
        testsRunner.expect(-Infinity).not.toBeGreaterThan(0)
        testsRunner.expect(0).not.toBeGreaterThan(Infinity)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle decimal precision correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Decimal precision test', async () => {
        testsRunner.expect(0.3).toBeGreaterThan(0.2)
        testsRunner.expect(0.1 + 0.2).toBeGreaterThan(0.3) // Floating point precision
        testsRunner.expect(1.0000001).toBeGreaterThan(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
