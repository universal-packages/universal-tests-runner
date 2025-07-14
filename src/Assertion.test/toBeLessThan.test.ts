import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeLessThanTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeLessThan assertion test', () => {
    selfTestsRunner.test('Should pass when value is less than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Less than test', async () => {
        testsRunner.expect(3).toBeLessThan(5)
        testsRunner.expect(5).toBeLessThan(10)
        testsRunner.expect(-1).toBeLessThan(0)
        testsRunner.expect(-5).toBeLessThan(-1)
        testsRunner.expect(3).toBeLessThan(3.14)
        testsRunner.expect(-1000).toBeLessThan(Infinity)
        testsRunner.expect(-Infinity).toBeLessThan(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not less than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not less than test', async () => {
        testsRunner.expect(5).toBeLessThan(3)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be less than {{target}}')
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

    selfTestsRunner.test('Should fail when values are equal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Equal values test', async () => {
        testsRunner.expect(5).toBeLessThan(5)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be less than {{target}}')
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
        testsRunner.expect('hello').toBeLessThan(5)
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

    selfTestsRunner.test('Should work with not.toBeLessThan for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeLessThan test', async () => {
        testsRunner.expect(5).not.toBeLessThan(3)
        testsRunner.expect(5).not.toBeLessThan(5) // Equal
        testsRunner.expect(0).not.toBeLessThan(-1)
        testsRunner.expect(Infinity).not.toBeLessThan(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeLessThan when value is less', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeLessThan test', async () => {
        testsRunner.expect(3).not.toBeLessThan(10)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be less than {{target}}, but it was')
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

    selfTestsRunner.test('Should handle edge cases with infinity and zero', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        testsRunner.expect(-Infinity).toBeLessThan(Infinity)
        testsRunner.expect(-Infinity).toBeLessThan(1)
        testsRunner.expect(-0.1).toBeLessThan(0)
        testsRunner.expect(0).toBeLessThan(0.1)

        // These should fail
        testsRunner.expect(0).not.toBeLessThan(-Infinity)
        testsRunner.expect(Infinity).not.toBeLessThan(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle decimal precision correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Decimal precision test', async () => {
        testsRunner.expect(0.2).toBeLessThan(0.3)
        testsRunner.expect(0.3).toBeLessThan(0.1 + 0.2) // Floating point precision
        testsRunner.expect(1).toBeLessThan(1.0000001)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
