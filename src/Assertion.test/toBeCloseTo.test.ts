import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeCloseToTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeCloseTo assertion test', () => {
    selfTestsRunner.test('Should pass when values are close with default precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Close values test', async () => {
        testsRunner.expect(0.1 + 0.2).toBeCloseTo(0.3) // Floating point precision issue
        testsRunner.expect(0.2 + 0.1).toBeCloseTo(0.3)
        testsRunner.expect(1.0).toBeCloseTo(1.0)
        testsRunner.expect(3.14159).toBeCloseTo(3.14159)
        testsRunner.expect(0.123456).toBeCloseTo(0.123457) // Should be close enough with default precision
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when values are close with custom precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Custom precision test', async () => {
        testsRunner.expect(3.14159).toBeCloseTo(3.14, 2) // 2 decimal places
        testsRunner.expect(3.14159).toBeCloseTo(3.141, 3) // 3 decimal places
        testsRunner.expect(1.23456).toBeCloseTo(1.235, 2) // 2 decimal places
        testsRunner.expect(100.001).toBeCloseTo(100, 0) // 0 decimal places (integers)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when values are not close enough', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not close enough test', async () => {
        testsRunner.expect(0.1).toBeCloseTo(0.2)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be close to {{target}} (precision: {{precision}})')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '0.2'
        },
        actual: {
          type: 'number',
          representation: '0.1'
        },
        precision: {
          type: 'number',
          representation: '2'
        }
      })
    })

    selfTestsRunner.test('Should fail when values are not close enough with custom precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Custom precision failure test', async () => {
        testsRunner.expect(3.14159).toBeCloseTo(3.15, 3) // Too far apart for 3 decimal places
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.messageLocals.precision).toEqual({
        type: 'number',
        representation: '3'
      })
    })

    selfTestsRunner.test('Should throw error when actual value is not a number', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number actual test', async () => {
        testsRunner.expect('hello').toBeCloseTo(5)
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

    selfTestsRunner.test('Should work with not.toBeCloseTo for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeCloseTo test', async () => {
        testsRunner.expect(0.1).not.toBeCloseTo(0.2)
        testsRunner.expect(3.14159).not.toBeCloseTo(3.15, 3) // Too far apart for 3 decimal places
        testsRunner.expect(100).not.toBeCloseTo(200)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeCloseTo when values are close', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeCloseTo test', async () => {
        testsRunner.expect(0.1 + 0.2).not.toBeCloseTo(0.3)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be close to {{target}} (precision: {{precision}}), but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '0.3'
        },
        actual: {
          type: 'number',
          representation: '0.30000000000000004'
        },
        precision: {
          type: 'number',
          representation: '2'
        }
      })
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Exact matches
        testsRunner.expect(0).toBeCloseTo(0)
        testsRunner.expect(1).toBeCloseTo(1)
        testsRunner.expect(-1).toBeCloseTo(-1)

        // Very small differences
        testsRunner.expect(0.000001).toBeCloseTo(0.000002, 5)

        // Large numbers
        testsRunner.expect(1000000.1).toBeCloseTo(1000000.2, 0)

        // Negative numbers
        testsRunner.expect(-3.14159).toBeCloseTo(-3.14, 2)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle infinity and special values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Special values test', async () => {
        testsRunner.expect(Infinity).toBeCloseTo(Infinity)
        testsRunner.expect(-Infinity).toBeCloseTo(-Infinity)

        // These should fail
        testsRunner.expect(Infinity).not.toBeCloseTo(-Infinity)
        testsRunner.expect(1).not.toBeCloseTo(Infinity)
        testsRunner.expect(-1).not.toBeCloseTo(-Infinity)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle precision edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Precision edge cases test', async () => {
        // Zero precision (integers only)
        testsRunner.expect(1.9).toBeCloseTo(2, 0)
        testsRunner.expect(1.1).toBeCloseTo(1, 0)

        // High precision
        testsRunner.expect(1.123456789).toBeCloseTo(1.123456788, 8)

        // Precision boundary - using values that are actually far enough apart
        testsRunner.expect(1.01).toBeCloseTo(1.0, 1) // Should be close at 1 decimal place (diff = 0.01, threshold = 0.1)
        testsRunner.expect(1.01).not.toBeCloseTo(1.0, 2) // Should not be close at 2 decimal places (diff = 0.01, threshold = 0.01)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
