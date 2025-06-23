import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function lessThanAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('LessThanAssertion test', () => {
    selfTestsRunner.test('Should match values less than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Less than test', async () => {
        // Values less than expected
        testsRunner.expect(5).toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect(0).toEqual(testsRunner.expectLessThan(1))
        testsRunner.expect(-1).toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(-10).toEqual(testsRunner.expectLessThan(-5))
        testsRunner.expect(99.9).toEqual(testsRunner.expectLessThan(100))

        // Test with floating point numbers
        testsRunner.expect(3.14).toEqual(testsRunner.expectLessThan(3.15))
        testsRunner.expect(0.1).toEqual(testsRunner.expectLessThan(0.2))
        testsRunner.expect(-0.1).toEqual(testsRunner.expectLessThan(0))

        // Test with large numbers
        testsRunner.expect(999999).toEqual(testsRunner.expectLessThan(1000000))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThan(-1000000))
        testsRunner.expect(1000000).toEqual(testsRunner.expectLessThan(Infinity))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values greater than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not less than test', async () => {
        // Values greater than expected should not match
        testsRunner.expect(10).not.toEqual(testsRunner.expectLessThan(5))
        testsRunner.expect(1).not.toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThan(-1))
        testsRunner.expect(100).not.toEqual(testsRunner.expectLessThan(99))
        testsRunner.expect(3.15).not.toEqual(testsRunner.expectLessThan(3.14))

        // Values equal to expected should not match (strict less than)
        testsRunner.expect(5).not.toEqual(testsRunner.expectLessThan(5))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(-1).not.toEqual(testsRunner.expectLessThan(-1))
        testsRunner.expect(3.14).not.toEqual(testsRunner.expectLessThan(3.14))
        testsRunner.expect(100).not.toEqual(testsRunner.expectLessThan(100))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values test', async () => {
        // Non-numbers should not match expectLessThan()
        testsRunner.expect('5').not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectLessThan(100))
        testsRunner.expect(true).not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect(false).not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect(null).not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect([]).not.toEqual(testsRunner.expectLessThan(10))
        testsRunner.expect({}).not.toEqual(testsRunner.expectLessThan(10))

        // But they should match not.expectLessThan() (negated version for non-numbers)
        testsRunner.expect('5').toEqual(testsRunner.not.expectLessThan(10))
        testsRunner.expect(null).toEqual(testsRunner.not.expectLessThan(10))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectLessThan(10))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated less than test', async () => {
        // Values greater than or equal should match not.expectLessThan()
        testsRunner.expect(10).toEqual(testsRunner.not.expectLessThan(5)) // Greater
        testsRunner.expect(5).toEqual(testsRunner.not.expectLessThan(5)) // Equal
        testsRunner.expect(0).toEqual(testsRunner.not.expectLessThan(-1)) // Greater
        testsRunner.expect(100).toEqual(testsRunner.not.expectLessThan(100)) // Equal
        testsRunner.expect(3.15).toEqual(testsRunner.not.expectLessThan(3.14))

        // Values less than should not match not.expectLessThan()
        testsRunner.expect(3).not.toEqual(testsRunner.not.expectLessThan(5))
        testsRunner.expect(0).not.toEqual(testsRunner.not.expectLessThan(10))
        testsRunner.expect(-10).not.toEqual(testsRunner.not.expectLessThan(-5))
        testsRunner.expect(3.13).not.toEqual(testsRunner.not.expectLessThan(3.14))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectLessThan', async () => {
        const systemLimits = {
          memory: {
            usage: 65, // < 70% is good
            warnings: 2, // < 5 warnings is acceptable
            errors: 0 // < 1 error is critical
          },
          cpu: {
            load: 45, // < 50% is optimal
            temperature: 60, // < 65°C is safe
            processes: 95 // < 100 processes is manageable
          },
          network: {
            latency: 25, // < 30ms is excellent
            packetLoss: 0.1, // < 0.5% is acceptable
            bandwidth: 850 // < 1000 Mbps is under capacity
          }
        }

        testsRunner.expect(systemLimits).toMatchObject({
          memory: {
            usage: testsRunner.expectLessThan(70), // 65 < 70
            warnings: testsRunner.expectLessThan(5), // 2 < 5
            errors: testsRunner.expectLessThan(1) // 0 < 1
          },
          cpu: {
            load: testsRunner.expectLessThan(50), // 45 < 50
            temperature: testsRunner.expectLessThan(65), // 60 < 65
            processes: testsRunner.expectLessThan(100) // 95 < 100
          },
          network: {
            latency: testsRunner.expectLessThan(30), // 25 < 30
            packetLoss: testsRunner.expectLessThan(0.5), // 0.1 < 0.5
            bandwidth: testsRunner.expectLessThan(1000) // 850 < 1000
          }
        })

        // Test with user age restrictions
        const userAccounts = [
          { name: 'Alice', age: 17 }, // < 18 (minor)
          { name: 'Bob', age: 25 }, // >= 18 (adult)
          { name: 'Carol', age: 16 }, // < 18 (minor)
          { name: 'Dave', age: 18 } // >= 18 (adult, exactly 18)
        ]

        testsRunner.expect(userAccounts).toEqual([
          { name: 'Alice', age: testsRunner.expectLessThan(18) }, // 17 < 18
          { name: 'Bob', age: testsRunner.not.expectLessThan(18) }, // 25 >= 18
          { name: 'Carol', age: testsRunner.expectLessThan(18) }, // 16 < 18
          { name: 'Dave', age: testsRunner.not.expectLessThan(18) } // 18 >= 18 (not less than)
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with special numbers
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThan(1000000))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThan(Infinity))
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectLessThan(-Infinity)) // Equal case
        testsRunner.expect(1000000).toEqual(testsRunner.expectLessThan(Infinity))
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectLessThan(1000000))
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectLessThan(Infinity)) // Equal case

        // NaN comparisons should fail
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectLessThan(NaN))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThan(NaN))

        // Zero boundary cases
        testsRunner.expect(-0.0000001).toEqual(testsRunner.expectLessThan(0))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThan(0)) // Equal
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThan(-0)) // Equal (-0 === 0)
        testsRunner.expect(-0).not.toEqual(testsRunner.expectLessThan(0)) // Equal
        testsRunner.expect(0.0000001).not.toEqual(testsRunner.expectLessThan(0))

        // Precision boundary testing
        testsRunner.expect(0.1).not.toEqual(testsRunner.expectLessThan(0.1)) // Equal
        testsRunner.expect(0.09999).toEqual(testsRunner.expectLessThan(0.1)) // Less than
        testsRunner.expect(0.10001).not.toEqual(testsRunner.expectLessThan(0.1)) // Greater than

        // Floating point precision issues
        testsRunner.expect(0.1 + 0.2).not.toEqual(testsRunner.expectLessThan(0.3)) // 0.30000000000000004 > 0.3
        testsRunner.expect(0.3).toEqual(testsRunner.expectLessThan(0.1 + 0.2)) // 0.3 < 0.30000000000000004
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
