import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeGreaterThanOrEqualTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeGreaterThanOrEqual assertion test', () => {
    selfTestsRunner.test('Should pass when value is greater than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Greater than or equal test', async () => {
        testsRunner.expect(5).toBeGreaterThanOrEqual(3)
        testsRunner.expect(5).toBeGreaterThanOrEqual(5) // Equal case
        testsRunner.expect(10).toBeGreaterThanOrEqual(5)
        testsRunner.expect(0).toBeGreaterThanOrEqual(-1)
        testsRunner.expect(0).toBeGreaterThanOrEqual(0)
        testsRunner.expect(-1).toBeGreaterThanOrEqual(-5)
        testsRunner.expect(3.14).toBeGreaterThanOrEqual(3)
        testsRunner.expect(Infinity).toBeGreaterThanOrEqual(1000)
        testsRunner.expect(1).toBeGreaterThanOrEqual(-Infinity)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is less than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Less than test', async () => {
        testsRunner.expect(3).toBeGreaterThanOrEqual(5)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be greater than or equal to {{target}}')
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

    selfTestsRunner.test('Should throw error when actual value is not a number', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number actual test', async () => {
        testsRunner.expect('hello').toBeGreaterThanOrEqual(5)
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

    selfTestsRunner.test('Should work with not.toBeGreaterThanOrEqual for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeGreaterThanOrEqual test', async () => {
        testsRunner.expect(3).not.toBeGreaterThanOrEqual(5)
        testsRunner.expect(-1).not.toBeGreaterThanOrEqual(0)
        testsRunner.expect(-Infinity).not.toBeGreaterThanOrEqual(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeGreaterThanOrEqual when value is greater or equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeGreaterThanOrEqual test', async () => {
        testsRunner.expect(10).not.toBeGreaterThanOrEqual(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be greater than or equal to {{target}}, but it was')
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

    selfTestsRunner.test('Should fail with not.toBeGreaterThanOrEqual when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Equal values not test', async () => {
        testsRunner.expect(5).not.toBeGreaterThanOrEqual(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be greater than or equal to {{target}}, but it was')
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
        testsRunner.expect(Infinity).toBeGreaterThanOrEqual(-Infinity)
        testsRunner.expect(Infinity).toBeGreaterThanOrEqual(Infinity) // Equal
        testsRunner.expect(1).toBeGreaterThanOrEqual(-Infinity)
        testsRunner.expect(0).toBeGreaterThanOrEqual(-0.1)
        testsRunner.expect(0).toBeGreaterThanOrEqual(0) // Equal
        testsRunner.expect(0.1).toBeGreaterThanOrEqual(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
