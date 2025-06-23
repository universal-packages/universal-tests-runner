import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function lessThanOrEqualAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('LessThanOrEqualAssertion test', () => {
    selfTestsRunner.test('Should match values less than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Less than or equal test', async () => {
        // Values less than expected
        testsRunner.expect(5).toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect(0).toEqual(testsRunner.expectLessThanOrEqual(1))
        testsRunner.expect(-1).toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(-10).toEqual(testsRunner.expectLessThanOrEqual(-5))
        testsRunner.expect(99.9).toEqual(testsRunner.expectLessThanOrEqual(100))

        // Values equal to expected (key difference from LessThan)
        testsRunner.expect(5).toEqual(testsRunner.expectLessThanOrEqual(5))
        testsRunner.expect(0).toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(-1).toEqual(testsRunner.expectLessThanOrEqual(-1))
        testsRunner.expect(3.14).toEqual(testsRunner.expectLessThanOrEqual(3.14))
        testsRunner.expect(100).toEqual(testsRunner.expectLessThanOrEqual(100))

        // Test with floating point numbers
        testsRunner.expect(3.14).toEqual(testsRunner.expectLessThanOrEqual(3.15))
        testsRunner.expect(0.1).toEqual(testsRunner.expectLessThanOrEqual(0.2))
        testsRunner.expect(0.3).toEqual(testsRunner.expectLessThanOrEqual(0.1 + 0.2)) // Due to floating point precision

        // Test with large numbers
        testsRunner.expect(999999).toEqual(testsRunner.expectLessThanOrEqual(1000000))
        testsRunner.expect(1000000).toEqual(testsRunner.expectLessThanOrEqual(1000000))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(1000000).toEqual(testsRunner.expectLessThanOrEqual(Infinity))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values greater than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not less than or equal test', async () => {
        // Values greater than expected should not match
        testsRunner.expect(10).not.toEqual(testsRunner.expectLessThanOrEqual(5))
        testsRunner.expect(1).not.toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThanOrEqual(-1))
        testsRunner.expect(100).not.toEqual(testsRunner.expectLessThanOrEqual(99))
        testsRunner.expect(3.15).not.toEqual(testsRunner.expectLessThanOrEqual(3.14))
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectLessThanOrEqual(1000000))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values test', async () => {
        // Non-numbers should not match expectLessThanOrEqual()
        testsRunner.expect('5').not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectLessThanOrEqual(100))
        testsRunner.expect(true).not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect(false).not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect(null).not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect([]).not.toEqual(testsRunner.expectLessThanOrEqual(10))
        testsRunner.expect({}).not.toEqual(testsRunner.expectLessThanOrEqual(10))

        // But they should match not.expectLessThanOrEqual() (negated version for non-numbers)
        testsRunner.expect('5').toEqual(testsRunner.not.expectLessThanOrEqual(10))
        testsRunner.expect(null).toEqual(testsRunner.not.expectLessThanOrEqual(10))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectLessThanOrEqual(10))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated less than or equal test', async () => {
        // Values greater than should match not.expectLessThanOrEqual()
        testsRunner.expect(10).toEqual(testsRunner.not.expectLessThanOrEqual(5)) // Greater
        testsRunner.expect(1).toEqual(testsRunner.not.expectLessThanOrEqual(0)) // Greater
        testsRunner.expect(100).toEqual(testsRunner.not.expectLessThanOrEqual(99)) // Greater
        testsRunner.expect(3.15).toEqual(testsRunner.not.expectLessThanOrEqual(3.14))

        // Values less than or equal should not match not.expectLessThanOrEqual()
        testsRunner.expect(3).not.toEqual(testsRunner.not.expectLessThanOrEqual(5)) // Less
        testsRunner.expect(5).not.toEqual(testsRunner.not.expectLessThanOrEqual(5)) // Equal
        testsRunner.expect(0).not.toEqual(testsRunner.not.expectLessThanOrEqual(10)) // Less
        testsRunner.expect(-10).not.toEqual(testsRunner.not.expectLessThanOrEqual(-5)) // Less
        testsRunner.expect(100).not.toEqual(testsRunner.not.expectLessThanOrEqual(100)) // Equal
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectLessThanOrEqual', async () => {
        const resourceUsage = {
          server1: {
            cpu: 85, // <= 90% is acceptable
            memory: 70, // <= 80% is safe
            disk: 45, // <= 50% is optimal
            connections: 100 // <= 100 is at capacity
          },
          server2: {
            cpu: 92, // > 90% is concerning
            memory: 75, // <= 80% is safe
            disk: 30, // <= 50% is optimal
            connections: 85 // <= 100 is under capacity
          },
          database: {
            connections: 150, // <= 200 is manageable
            queryTime: 250, // <= 300ms is acceptable
            lockWait: 50, // <= 100ms is tolerable
            storage: 800 // <= 1000GB is under limit
          }
        }

        testsRunner.expect(resourceUsage).toMatchObject({
          server1: {
            cpu: testsRunner.expectLessThanOrEqual(90), // 85 <= 90
            memory: testsRunner.expectLessThanOrEqual(80), // 70 <= 80
            disk: testsRunner.expectLessThanOrEqual(50), // 45 <= 50
            connections: testsRunner.expectLessThanOrEqual(100) // 100 <= 100 (equal is ok)
          },
          server2: {
            cpu: testsRunner.not.expectLessThanOrEqual(90), // 92 > 90
            memory: testsRunner.expectLessThanOrEqual(80), // 75 <= 80
            disk: testsRunner.expectLessThanOrEqual(50), // 30 <= 50
            connections: testsRunner.expectLessThanOrEqual(100) // 85 <= 100
          },
          database: {
            connections: testsRunner.expectLessThanOrEqual(200), // 150 <= 200
            queryTime: testsRunner.expectLessThanOrEqual(300), // 250 <= 300
            lockWait: testsRunner.expectLessThanOrEqual(100), // 50 <= 100
            storage: testsRunner.expectLessThanOrEqual(1000) // 800 <= 1000
          }
        })

        // Test with grade boundaries where maximum scores are allowed
        const studentGrades = [
          { name: 'Alice', score: 95 }, // <= 100 (A grade)
          { name: 'Bob', score: 85 }, // <= 100 (B grade)
          { name: 'Carol', score: 100 }, // <= 100 (perfect score)
          { name: 'Dave', score: 75 } // <= 100 (C grade)
        ]

        testsRunner.expect(studentGrades).toEqual([
          { name: 'Alice', score: testsRunner.expectLessThanOrEqual(100) }, // 95 <= 100
          { name: 'Bob', score: testsRunner.expectLessThanOrEqual(100) }, // 85 <= 100
          { name: 'Carol', score: testsRunner.expectLessThanOrEqual(100) }, // 100 <= 100 (equal passes)
          { name: 'Dave', score: testsRunner.expectLessThanOrEqual(100) } // 75 <= 100
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with special numbers
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThanOrEqual(1000000))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThanOrEqual(Infinity))
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectLessThanOrEqual(-Infinity)) // Equal case
        testsRunner.expect(1000000).toEqual(testsRunner.expectLessThanOrEqual(Infinity))
        testsRunner.expect(Infinity).toEqual(testsRunner.expectLessThanOrEqual(Infinity)) // Equal case
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectLessThanOrEqual(1000000))

        // NaN comparisons should fail
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectLessThanOrEqual(NaN))
        testsRunner.expect(0).not.toEqual(testsRunner.expectLessThanOrEqual(NaN))

        // Zero boundary cases
        testsRunner.expect(-0.0000001).toEqual(testsRunner.expectLessThanOrEqual(0))
        testsRunner.expect(0).toEqual(testsRunner.expectLessThanOrEqual(0)) // Equal
        testsRunner.expect(0).toEqual(testsRunner.expectLessThanOrEqual(-0)) // Equal (-0 === 0)
        testsRunner.expect(-0).toEqual(testsRunner.expectLessThanOrEqual(0)) // Equal
        testsRunner.expect(0.0000001).not.toEqual(testsRunner.expectLessThanOrEqual(0))

        // Precision boundary testing
        testsRunner.expect(0.1).toEqual(testsRunner.expectLessThanOrEqual(0.1)) // Equal
        testsRunner.expect(0.09999).toEqual(testsRunner.expectLessThanOrEqual(0.1)) // Less than
        testsRunner.expect(0.10001).not.toEqual(testsRunner.expectLessThanOrEqual(0.1)) // Greater than

        // Floating point precision issues
        testsRunner.expect(0.3).toEqual(testsRunner.expectLessThanOrEqual(0.1 + 0.2)) // 0.3 <= 0.30000000000000004
        testsRunner.expect(0.1 + 0.2).not.toEqual(testsRunner.expectLessThanOrEqual(0.3)) // 0.30000000000000004 > 0.3
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
