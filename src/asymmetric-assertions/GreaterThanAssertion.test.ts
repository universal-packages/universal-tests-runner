import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function greaterThanAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('GreaterThanAssertion test', () => {
    selfTestsRunner.test('Should match values greater than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Greater than test', async () => {
        // Basic greater than tests
        testsRunner.expect(10).toEqual(testsRunner.expectGreaterThan(5))
        testsRunner.expect(1).toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(0.1).toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(-1).toEqual(testsRunner.expectGreaterThan(-2))
        testsRunner.expect(100.5).toEqual(testsRunner.expectGreaterThan(100))

        // Test with floating point numbers
        testsRunner.expect(3.14159).toEqual(testsRunner.expectGreaterThan(3.14))
        testsRunner.expect(0.1 + 0.2).toEqual(testsRunner.expectGreaterThan(0.3)) // Due to floating point precision

        // Test with large numbers
        testsRunner.expect(Infinity).toEqual(testsRunner.expectGreaterThan(1000000))
        testsRunner.expect(1000000).toEqual(testsRunner.expectGreaterThan(999999))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values less than or equal to expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not greater than test', async () => {
        // Values equal to expected should not match
        testsRunner.expect(5).not.toEqual(testsRunner.expectGreaterThan(5))
        testsRunner.expect(0).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(-1).not.toEqual(testsRunner.expectGreaterThan(-1))
        testsRunner.expect(3.14).not.toEqual(testsRunner.expectGreaterThan(3.14))

        // Values less than expected should not match
        testsRunner.expect(1).not.toEqual(testsRunner.expectGreaterThan(5))
        testsRunner.expect(-5).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(99).not.toEqual(testsRunner.expectGreaterThan(100))
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectGreaterThan(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values test', async () => {
        // Non-numbers should not match expectGreaterThan()
        testsRunner.expect('10').not.toEqual(testsRunner.expectGreaterThan(5))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(true).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(false).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(null).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect([]).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect({}).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(new Date()).not.toEqual(testsRunner.expectGreaterThan(0))

        // But they should match not.expectGreaterThan() (negated version for non-numbers)
        testsRunner.expect('10').toEqual(testsRunner.not.expectGreaterThan(5))
        testsRunner.expect(null).toEqual(testsRunner.not.expectGreaterThan(0))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectGreaterThan(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated greater than test', async () => {
        // Values less than or equal should match not.expectGreaterThan()
        testsRunner.expect(5).toEqual(testsRunner.not.expectGreaterThan(5)) // Equal
        testsRunner.expect(3).toEqual(testsRunner.not.expectGreaterThan(5)) // Less
        testsRunner.expect(0).toEqual(testsRunner.not.expectGreaterThan(10)) // Much less
        testsRunner.expect(-10).toEqual(testsRunner.not.expectGreaterThan(-5)) // Negative numbers

        // Values greater than should not match not.expectGreaterThan()
        testsRunner.expect(10).not.toEqual(testsRunner.not.expectGreaterThan(5))
        testsRunner.expect(1).not.toEqual(testsRunner.not.expectGreaterThan(0))
        testsRunner.expect(0.1).not.toEqual(testsRunner.not.expectGreaterThan(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectGreaterThan', async () => {
        const gameStats = {
          player: {
            level: 25,
            experience: 15000,
            stats: {
              health: 100,
              attack: 45,
              defense: 30,
              speed: 80
            }
          },
          scores: [1200, 950, 1800, 600, 2100],
          performance: {
            accuracy: 0.85,
            reaction: 120.5,
            combo: 15
          }
        }

        testsRunner.expect(gameStats).toMatchObject({
          player: {
            level: testsRunner.expectGreaterThan(20), // Level > 20
            experience: testsRunner.expectGreaterThan(10000), // Exp > 10k
            stats: {
              health: testsRunner.expectGreaterThan(90), // Health > 90
              attack: testsRunner.expectGreaterThan(40), // Attack > 40
              defense: testsRunner.expectGreaterThan(25), // Defense > 25
              speed: testsRunner.expectGreaterThan(75) // Speed > 75
            }
          },
          performance: {
            accuracy: testsRunner.expectGreaterThan(0.8), // Accuracy > 80%
            reaction: testsRunner.expectGreaterThan(100), // Reaction > 100ms
            combo: testsRunner.expectGreaterThan(10) // Combo > 10
          }
        })

        // Test with array where all values should be greater than threshold
        testsRunner.expect(gameStats.scores).toEqual([
          testsRunner.expectGreaterThan(1000), // 1200 > 1000
          testsRunner.not.expectGreaterThan(1000), // 950 < 1000
          testsRunner.expectGreaterThan(1000), // 1800 > 1000
          testsRunner.not.expectGreaterThan(1000), // 600 < 1000
          testsRunner.expectGreaterThan(1000) // 2100 > 1000
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with special numbers
        testsRunner.expect(Infinity).toEqual(testsRunner.expectGreaterThan(1000000))
        testsRunner.expect(1000000).not.toEqual(testsRunner.expectGreaterThan(Infinity))
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectGreaterThan(-1000000))

        // NaN comparisons should fail
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectGreaterThan(NaN))

        // Very small differences
        testsRunner.expect(0.0000001).toEqual(testsRunner.expectGreaterThan(0))
        testsRunner.expect(1.0000001).toEqual(testsRunner.expectGreaterThan(1))

        // Boundary testing
        testsRunner.expect(0.1).toEqual(testsRunner.expectGreaterThan(0.09999))
        testsRunner.expect(0.1).not.toEqual(testsRunner.expectGreaterThan(0.1))
        testsRunner.expect(0.1).not.toEqual(testsRunner.expectGreaterThan(0.10001))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
