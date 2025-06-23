import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function anythingAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('AnythingAssertion test', () => {
    selfTestsRunner.test('Should match any value when not negated', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Match any value test', async () => {
        // Test various types
        testsRunner.expect('hello').toEqual(testsRunner.expectAnything())
        testsRunner.expect(42).toEqual(testsRunner.expectAnything())
        testsRunner.expect(true).toEqual(testsRunner.expectAnything())
        testsRunner.expect(false).toEqual(testsRunner.expectAnything())
        testsRunner.expect(null).toEqual(testsRunner.expectAnything())
        testsRunner.expect(undefined).toEqual(testsRunner.expectAnything())
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectAnything())
        testsRunner.expect({ key: 'value' }).toEqual(testsRunner.expectAnything())
        testsRunner.expect(new Date()).toEqual(testsRunner.expectAnything())
        testsRunner.expect(() => {}).toEqual(testsRunner.expectAnything())
        testsRunner.expect(Symbol('test')).toEqual(testsRunner.expectAnything())
        testsRunner.expect(0).toEqual(testsRunner.expectAnything())
        testsRunner.expect('').toEqual(testsRunner.expectAnything())
        testsRunner.expect(NaN).toEqual(testsRunner.expectAnything())
        testsRunner.expect(Infinity).toEqual(testsRunner.expectAnything())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match any value when negated', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not match any value test', async () => {
        // Test various types - all should fail with not.expectAnything()
        testsRunner.expect('hello').not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect(42).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect(true).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect(false).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect(null).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect(undefined).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect([]).not.toEqual(testsRunner.not.expectAnything())
        testsRunner.expect({}).not.toEqual(testsRunner.not.expectAnything())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectAnything', async () => {
        const apiResponse = {
          status: 'success',
          data: {
            user: {
              id: 123,
              name: 'John Doe',
              metadata: {
                lastLogin: new Date(),
                preferences: { theme: 'dark' }
              }
            },
            timestamp: Date.now()
          }
        }

        // Test with expectAnything for dynamic fields
        testsRunner.expect(apiResponse).toEqual({
          status: 'success',
          data: {
            user: {
              id: 123,
              name: 'John Doe',
              metadata: {
                lastLogin: testsRunner.expectAnything(), // Any date
                preferences: testsRunner.expectAnything() // Any preferences object
              }
            },
            timestamp: testsRunner.expectAnything() // Any timestamp
          }
        })

        // Test with arrays containing anything
        const logEntries = [
          { level: 'info', message: 'Server started', timestamp: Date.now() },
          { level: 'warn', message: 'Deprecated API used', timestamp: Date.now() + 1000 },
          { level: 'error', message: 'Connection failed', timestamp: Date.now() + 2000 }
        ]

        testsRunner.expect(logEntries).toEqual([
          { level: 'info', message: 'Server started', timestamp: testsRunner.expectAnything() },
          { level: 'warn', message: 'Deprecated API used', timestamp: testsRunner.expectAnything() },
          { level: 'error', message: 'Connection failed', timestamp: testsRunner.expectAnything() }
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with mixed assertions', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mixed assertions test', async () => {
        const complexData = {
          exact: 'must be exact',
          flexible: { could: 'be anything' },
          numbers: [1, 2, 3],
          dynamic: Math.random()
        }

        testsRunner.expect(complexData).toEqual({
          exact: 'must be exact', // Exact match required
          flexible: testsRunner.expectAnything(), // Any object is fine
          numbers: [1, 2, 3], // Exact array match
          dynamic: testsRunner.expectAnything() // Any number is fine
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
