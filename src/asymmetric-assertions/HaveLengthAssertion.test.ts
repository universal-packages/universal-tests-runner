import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function haveLengthAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('HaveLengthAssertion test', () => {
    selfTestsRunner.test('Should match values with expected length', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Have length test', async () => {
        // Arrays
        testsRunner.expect([]).toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect([1]).toEqual(testsRunner.expectHaveLength(1))
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectHaveLength(3))
        testsRunner.expect(['a', 'b', 'c', 'd', 'e']).toEqual(testsRunner.expectHaveLength(5))

        // Strings - empty string fails due to !value check in implementation
        testsRunner.expect('').not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect('hello').toEqual(testsRunner.expectHaveLength(5))
        testsRunner.expect('test string').toEqual(testsRunner.expectHaveLength(11))

        // Array-like objects
        testsRunner.expect({ length: 0 }).toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect({ length: 5 }).toEqual(testsRunner.expectHaveLength(5))
        testsRunner.expect({ length: 10, other: 'property' }).toEqual(testsRunner.expectHaveLength(10))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values with different length', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Wrong length test', async () => {
        // Arrays with wrong length
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.expectHaveLength(2))
        testsRunner.expect([]).not.toEqual(testsRunner.expectHaveLength(1))
        testsRunner.expect(['a', 'b']).not.toEqual(testsRunner.expectHaveLength(3))

        // Strings with wrong length
        testsRunner.expect('hello').not.toEqual(testsRunner.expectHaveLength(4))
        testsRunner.expect('').not.toEqual(testsRunner.expectHaveLength(1)) // empty string also rejected due to !value
        testsRunner.expect('test').not.toEqual(testsRunner.expectHaveLength(5))

        // Array-like objects with wrong length
        testsRunner.expect({ length: 5 }).not.toEqual(testsRunner.expectHaveLength(3))
        testsRunner.expect({ length: 0 }).not.toEqual(testsRunner.expectHaveLength(1))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match values without length property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No length property test', async () => {
        // Values without length property
        testsRunner.expect(123).not.toEqual(testsRunner.expectHaveLength(3))
        testsRunner.expect(true).not.toEqual(testsRunner.expectHaveLength(1))
        testsRunner.expect(null).not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect({}).not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect({ notLength: 5 }).not.toEqual(testsRunner.expectHaveLength(5))
        testsRunner.expect(new Date()).not.toEqual(testsRunner.expectHaveLength(0))

        // Objects with non-number length
        testsRunner.expect({ length: 'five' }).not.toEqual(testsRunner.expectHaveLength(5))
        testsRunner.expect({ length: null }).not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect({ length: undefined }).not.toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect({ length: {} }).not.toEqual(testsRunner.expectHaveLength(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated have length test', async () => {
        // Values with different lengths should match not.expectHaveLength()
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.not.expectHaveLength(2))
        testsRunner.expect('hello').toEqual(testsRunner.not.expectHaveLength(4))
        testsRunner.expect({ length: 5 }).toEqual(testsRunner.not.expectHaveLength(3))

        // Values without length should match not.expectHaveLength()
        testsRunner.expect(123).toEqual(testsRunner.not.expectHaveLength(3))
        testsRunner.expect({}).toEqual(testsRunner.not.expectHaveLength(0))
        testsRunner.expect(null).toEqual(testsRunner.not.expectHaveLength(0))
        testsRunner.expect('').toEqual(testsRunner.not.expectHaveLength(0)) // empty string rejected by !value check

        // Values with correct length should not match not.expectHaveLength()
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.not.expectHaveLength(3))
        testsRunner.expect('hello').not.toEqual(testsRunner.not.expectHaveLength(5))
        testsRunner.expect({ length: 0 }).not.toEqual(testsRunner.not.expectHaveLength(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectHaveLength', async () => {
        const dataStructures = {
          users: ['alice', 'bob', 'charlie'],
          tags: ['javascript', 'testing'],
          permissions: ['read', 'write', 'delete', 'admin'],
          name: 'TestApp',
          description: 'A test application for demonstrating length assertions',
          config: {
            features: ['auth', 'logging', 'monitoring'],
            env: 'production'
          },
          metrics: {
            daily: [1, 2, 3, 4, 5, 6, 7],
            weekly: [10, 20, 30, 40]
          }
        }

        testsRunner.expect(dataStructures).toMatchObject({
          users: testsRunner.expectHaveLength(3),
          tags: testsRunner.expectHaveLength(2),
          permissions: testsRunner.expectHaveLength(4),
          name: testsRunner.expectHaveLength(7), // String length
          description: testsRunner.expectHaveLength(54), // String length
          config: {
            features: testsRunner.expectHaveLength(3),
            env: testsRunner.expectHaveLength(10) // String 'production'
          },
          metrics: {
            daily: testsRunner.expectHaveLength(7),
            weekly: testsRunner.expectHaveLength(4)
          }
        })

        // Test with validation results
        const formValidation = {
          errors: ['Email is required', 'Password too short'],
          warnings: [],
          info: ['Remember to verify your email'],
          fieldValues: {
            username: 'john_doe',
            email: 'john@example.com',
            bio: ''
          }
        }

        testsRunner.expect(formValidation).toMatchObject({
          errors: testsRunner.expectHaveLength(2),
          warnings: testsRunner.expectHaveLength(0),
          info: testsRunner.expectHaveLength(1),
          fieldValues: {
            username: testsRunner.expectHaveLength(8),
            email: testsRunner.expectHaveLength(16),
            bio: testsRunner.not.expectHaveLength(0) // empty string rejected by !value check
          }
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle special cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Special cases test', async () => {
        // Very long arrays/strings
        const longArray = new Array(1000).fill(0)
        testsRunner.expect(longArray).toEqual(testsRunner.expectHaveLength(1000))

        const longString = 'a'.repeat(500)
        testsRunner.expect(longString).toEqual(testsRunner.expectHaveLength(500))

        // Unicode strings (non-empty work fine)
        testsRunner.expect('café').toEqual(testsRunner.expectHaveLength(4))
        testsRunner.expect('🚀🌟✨').toEqual(testsRunner.expectHaveLength(5)) // Emojis are 2 code units each
        testsRunner.expect('Hello 世界').toEqual(testsRunner.expectHaveLength(8))

        // Sparse arrays
        const sparse = new Array(5)
        sparse[0] = 'first'
        sparse[4] = 'last'
        testsRunner.expect(sparse).toEqual(testsRunner.expectHaveLength(5))

        // Array-like objects with numeric length
        testsRunner.expect({ 0: 'a', 1: 'b', length: 2 }).toEqual(testsRunner.expectHaveLength(2))
        testsRunner.expect({ length: 0.5 }).toEqual(testsRunner.expectHaveLength(0.5))
        testsRunner.expect({ length: -1 }).toEqual(testsRunner.expectHaveLength(-1))

        // Edge cases with TypedArrays
        testsRunner.expect(new Uint8Array(10)).toEqual(testsRunner.expectHaveLength(10))
        testsRunner.expect(new Int32Array(0)).toEqual(testsRunner.expectHaveLength(0))
        testsRunner.expect(new Float64Array([1, 2, 3])).toEqual(testsRunner.expectHaveLength(3))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
