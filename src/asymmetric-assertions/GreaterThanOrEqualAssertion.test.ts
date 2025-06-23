import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function greaterThanOrEqualAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('GreaterThanOrEqualAssertion test', () => {
    selfTestsRunner.test('Should match values greater than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Greater than or equal test', async () => {
        // Values greater than expected
        testsRunner.expect(10).toEqual(testsRunner.expectGreaterThanOrEqual(5))
        testsRunner.expect(1).toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(0.1).toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(-1).toEqual(testsRunner.expectGreaterThanOrEqual(-2))
        testsRunner.expect(100.5).toEqual(testsRunner.expectGreaterThanOrEqual(100))

        // Values equal to expected (key difference from GreaterThan)
        testsRunner.expect(5).toEqual(testsRunner.expectGreaterThanOrEqual(5))
        testsRunner.expect(0).toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(-1).toEqual(testsRunner.expectGreaterThanOrEqual(-1))
        testsRunner.expect(3.14).toEqual(testsRunner.expectGreaterThanOrEqual(3.14))
        testsRunner.expect(100).toEqual(testsRunner.expectGreaterThanOrEqual(100))

        // Test with floating point numbers
        testsRunner.expect(3.14159).toEqual(testsRunner.expectGreaterThanOrEqual(3.14))
        testsRunner.expect(0.1 + 0.2).toEqual(testsRunner.expectGreaterThanOrEqual(0.3)) // Due to floating point precision

        // Test with large numbers
        testsRunner.expect(Infinity).toEqual(testsRunner.expectGreaterThanOrEqual(1000000))
        testsRunner.expect(1000000).toEqual(testsRunner.expectGreaterThanOrEqual(999999))
        testsRunner.expect(1000000).toEqual(testsRunner.expectGreaterThanOrEqual(1000000))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values less than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not greater than or equal test', async () => {
        // Values less than expected should not match
        testsRunner.expect(1).not.toEqual(testsRunner.expectGreaterThanOrEqual(5))
        testsRunner.expect(-5).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(99).not.toEqual(testsRunner.expectGreaterThanOrEqual(100))
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(3.13).not.toEqual(testsRunner.expectGreaterThanOrEqual(3.14))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values test', async () => {
        // Non-numbers should not match expectGreaterThanOrEqual()
        testsRunner.expect('10').not.toEqual(testsRunner.expectGreaterThanOrEqual(5))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(true).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(false).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(null).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect([]).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect({}).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))

        // But they should match not.expectGreaterThanOrEqual() (negated version for non-numbers)
        testsRunner.expect('10').toEqual(testsRunner.not.expectGreaterThanOrEqual(5))
        testsRunner.expect(null).toEqual(testsRunner.not.expectGreaterThanOrEqual(0))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectGreaterThanOrEqual(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated greater than or equal test', async () => {
        // Values less than should match not.expectGreaterThanOrEqual()
        testsRunner.expect(3).toEqual(testsRunner.not.expectGreaterThanOrEqual(5)) // Less
        testsRunner.expect(0).toEqual(testsRunner.not.expectGreaterThanOrEqual(10)) // Much less
        testsRunner.expect(-10).toEqual(testsRunner.not.expectGreaterThanOrEqual(-5)) // Negative numbers
        testsRunner.expect(3.13).toEqual(testsRunner.not.expectGreaterThanOrEqual(3.14))

        // Values greater than or equal should not match not.expectGreaterThanOrEqual()
        testsRunner.expect(5).not.toEqual(testsRunner.not.expectGreaterThanOrEqual(5)) // Equal
        testsRunner.expect(10).not.toEqual(testsRunner.not.expectGreaterThanOrEqual(5)) // Greater
        testsRunner.expect(1).not.toEqual(testsRunner.not.expectGreaterThanOrEqual(0))
        testsRunner.expect(0.1).not.toEqual(testsRunner.not.expectGreaterThanOrEqual(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectGreaterThanOrEqual', async () => {
        const performanceMetrics = {
          response: {
            average: 120, // >= 100ms acceptable
            p95: 200, // >= 150ms acceptable
            p99: 350 // >= 300ms acceptable
          },
          throughput: {
            requestsPerSec: 1000, // >= 800 rps minimum
            concurrent: 50 // >= 50 concurrent minimum
          },
          resources: {
            cpuUsage: 75, // >= 70% is high but acceptable
            memoryUsage: 80, // >= 80% is at limit
            diskUsage: 45 // >= 40% is acceptable
          }
        }

        testsRunner.expect(performanceMetrics).toMatchObject({
          response: {
            average: testsRunner.expectGreaterThanOrEqual(100), // 120 >= 100
            p95: testsRunner.expectGreaterThanOrEqual(150), // 200 >= 150
            p99: testsRunner.expectGreaterThanOrEqual(300) // 350 >= 300
          },
          throughput: {
            requestsPerSec: testsRunner.expectGreaterThanOrEqual(800), // 1000 >= 800
            concurrent: testsRunner.expectGreaterThanOrEqual(50) // 50 >= 50 (equal is ok)
          },
          resources: {
            cpuUsage: testsRunner.expectGreaterThanOrEqual(70), // 75 >= 70
            memoryUsage: testsRunner.expectGreaterThanOrEqual(80), // 80 >= 80 (equal is ok)
            diskUsage: testsRunner.expectGreaterThanOrEqual(40) // 45 >= 40
          }
        })

        // Test with scoring system where minimum thresholds must be met
        const examResults = [
          { student: 'Alice', score: 85 }, // >= 80 to pass
          { student: 'Bob', score: 92 }, // >= 80 to pass
          { student: 'Charlie', score: 78 }, // < 80 fails
          { student: 'Diana', score: 80 } // >= 80 exactly passes
        ]

        testsRunner.expect(examResults).toEqual([
          { student: 'Alice', score: testsRunner.expectGreaterThanOrEqual(80) },
          { student: 'Bob', score: testsRunner.expectGreaterThanOrEqual(80) },
          { student: 'Charlie', score: testsRunner.not.expectGreaterThanOrEqual(80) },
          { student: 'Diana', score: testsRunner.expectGreaterThanOrEqual(80) } // Equal passes
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with special numbers
        testsRunner.expect(Infinity).toEqual(testsRunner.expectGreaterThanOrEqual(1000000))
        testsRunner.expect(Infinity).toEqual(testsRunner.expectGreaterThanOrEqual(Infinity)) // Equal case
        testsRunner.expect(1000000).not.toEqual(testsRunner.expectGreaterThanOrEqual(Infinity))
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectGreaterThanOrEqual(-1000000))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectGreaterThanOrEqual(-Infinity)) // Equal case

        // NaN comparisons should fail
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectGreaterThanOrEqual(NaN))

        // Zero boundary cases
        testsRunner.expect(0).toEqual(testsRunner.expectGreaterThanOrEqual(0)) // Equal
        testsRunner.expect(0).toEqual(testsRunner.expectGreaterThanOrEqual(-0)) // Equal (-0 === 0)
        testsRunner.expect(-0).toEqual(testsRunner.expectGreaterThanOrEqual(0)) // Equal
        testsRunner.expect(0.0000001).toEqual(testsRunner.expectGreaterThanOrEqual(0))
        testsRunner.expect(-0.0000001).not.toEqual(testsRunner.expectGreaterThanOrEqual(0))

        // Precision boundary testing
        testsRunner.expect(0.1).toEqual(testsRunner.expectGreaterThanOrEqual(0.1)) // Equal
        testsRunner.expect(0.1).not.toEqual(testsRunner.expectGreaterThanOrEqual(0.10001)) // Less than
        testsRunner.expect(0.10001).toEqual(testsRunner.expectGreaterThanOrEqual(0.1)) // Greater than
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
