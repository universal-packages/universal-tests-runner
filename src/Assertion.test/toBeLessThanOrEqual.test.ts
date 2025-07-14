import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeLessThanOrEqualTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeLessThanOrEqual assertion test', () => {
    selfTestsRunner.test('Should pass when value is less than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Less than or equal test', async () => {
        testsRunner.expect(3).toBeLessThanOrEqual(5)
        testsRunner.expect(5).toBeLessThanOrEqual(5) // Equal case
        testsRunner.expect(5).toBeLessThanOrEqual(10)
        testsRunner.expect(-1).toBeLessThanOrEqual(0)
        testsRunner.expect(0).toBeLessThanOrEqual(0)
        testsRunner.expect(-5).toBeLessThanOrEqual(-1)
        testsRunner.expect(3).toBeLessThanOrEqual(3.14)
        testsRunner.expect(-1000).toBeLessThanOrEqual(Infinity)
        testsRunner.expect(-Infinity).toBeLessThanOrEqual(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is greater than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Greater than test', async () => {
        testsRunner.expect(5).toBeLessThanOrEqual(3)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be less than or equal to {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '3'
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
        testsRunner.expect('hello').toBeLessThanOrEqual(5)
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

    selfTestsRunner.test('Should work with not.toBeLessThanOrEqual for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeLessThanOrEqual test', async () => {
        testsRunner.expect(5).not.toBeLessThanOrEqual(3)
        testsRunner.expect(0).not.toBeLessThanOrEqual(-1)
        testsRunner.expect(Infinity).not.toBeLessThanOrEqual(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeLessThanOrEqual when value is less or equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeLessThanOrEqual test', async () => {
        testsRunner.expect(3).not.toBeLessThanOrEqual(10)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be less than or equal to {{target}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '10'
        },
        actual: {
          type: 'number',
          representation: '3'
        }
      })
    })

    selfTestsRunner.test('Should fail with not.toBeLessThanOrEqual when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Equal values not test', async () => {
        testsRunner.expect(5).not.toBeLessThanOrEqual(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be less than or equal to {{target}}, but it was')
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

    selfTestsRunner.test('Should handle edge cases with infinity and zero', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        testsRunner.expect(-Infinity).toBeLessThanOrEqual(Infinity)
        testsRunner.expect(-Infinity).toBeLessThanOrEqual(-Infinity) // Equal
        testsRunner.expect(-Infinity).toBeLessThanOrEqual(1)
        testsRunner.expect(-0.1).toBeLessThanOrEqual(0)
        testsRunner.expect(0).toBeLessThanOrEqual(0) // Equal
        testsRunner.expect(0).toBeLessThanOrEqual(0.1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
