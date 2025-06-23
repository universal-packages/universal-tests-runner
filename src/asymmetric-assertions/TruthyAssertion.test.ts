import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function truthyAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('TruthyAssertion test', () => {
    selfTestsRunner.test('Should match truthy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Truthy values test', async () => {
        // Test truthy primitives
        testsRunner.expect(true).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(1).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(-1).toEqual(testsRunner.expectTruthy())
        testsRunner.expect('hello').toEqual(testsRunner.expectTruthy())
        testsRunner.expect('0').toEqual(testsRunner.expectTruthy()) // String '0' is truthy
        testsRunner.expect(' ').toEqual(testsRunner.expectTruthy()) // Space is truthy
        testsRunner.expect(Infinity).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(-Infinity).toEqual(testsRunner.expectTruthy())

        // Test truthy objects
        testsRunner.expect([]).toEqual(testsRunner.expectTruthy()) // Empty array is truthy
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectTruthy())
        testsRunner.expect({}).toEqual(testsRunner.expectTruthy()) // Empty object is truthy
        testsRunner.expect({ key: 'value' }).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(new Date()).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(() => {}).toEqual(testsRunner.expectTruthy())
        testsRunner.expect(Symbol('test')).toEqual(testsRunner.expectTruthy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy values rejection test', async () => {
        // Test falsy values - should not match expectTruthy()
        testsRunner.expect(false).not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect(0).not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect(-0).not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect('').not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect(null).not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectTruthy())
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectTruthy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated truthy test', async () => {
        // Falsy values should match not.expectTruthy()
        testsRunner.expect(false).toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect(0).toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect('').toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect(null).toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect(NaN).toEqual(testsRunner.not.expectTruthy())

        // Truthy values should not match not.expectTruthy()
        testsRunner.expect(true).not.toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect(1).not.toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect('hello').not.toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect([]).not.toEqual(testsRunner.not.expectTruthy())
        testsRunner.expect({}).not.toEqual(testsRunner.not.expectTruthy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectTruthy', async () => {
        const formData = {
          username: 'john_doe', // truthy
          email: 'john@example.com', // truthy
          age: 25, // truthy
          isActive: true, // truthy
          description: '', // falsy
          avatar: null, // falsy
          preferences: {
            notifications: true, // truthy
            theme: 'dark' // truthy
          }
        }

        testsRunner.expect(formData).toMatchObject({
          username: testsRunner.expectTruthy(),
          email: testsRunner.expectTruthy(),
          age: testsRunner.expectTruthy(),
          isActive: testsRunner.expectTruthy(),
          description: testsRunner.not.expectTruthy(), // Should be falsy
          avatar: testsRunner.not.expectTruthy(), // Should be falsy
          preferences: {
            notifications: testsRunner.expectTruthy(),
            theme: testsRunner.expectTruthy()
          }
        })

        // Test with array of mixed truthy/falsy values
        const validationResults = [
          { field: 'username', valid: true, message: 'Valid username' },
          { field: 'email', valid: true, message: 'Valid email' },
          { field: 'password', valid: false, message: '' }, // Empty message is falsy
          { field: 'phone', valid: false, message: null } // null message is falsy
        ]

        testsRunner.expect(validationResults).toEqual([
          { field: 'username', valid: testsRunner.expectTruthy(), message: testsRunner.expectTruthy() },
          { field: 'email', valid: testsRunner.expectTruthy(), message: testsRunner.expectTruthy() },
          { field: 'password', valid: testsRunner.not.expectTruthy(), message: testsRunner.not.expectTruthy() },
          { field: 'phone', valid: testsRunner.not.expectTruthy(), message: testsRunner.not.expectTruthy() }
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
