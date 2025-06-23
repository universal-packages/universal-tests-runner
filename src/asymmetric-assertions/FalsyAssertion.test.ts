import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function falsyAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('FalsyAssertion test', () => {
    selfTestsRunner.test('Should match falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy values test', async () => {
        // Test all falsy primitives
        testsRunner.expect(false).toEqual(testsRunner.expectFalsy())
        testsRunner.expect(0).toEqual(testsRunner.expectFalsy())
        testsRunner.expect(-0).toEqual(testsRunner.expectFalsy())
        testsRunner.expect('').toEqual(testsRunner.expectFalsy())
        testsRunner.expect(null).toEqual(testsRunner.expectFalsy())
        testsRunner.expect(undefined).toEqual(testsRunner.expectFalsy())
        testsRunner.expect(NaN).toEqual(testsRunner.expectFalsy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match truthy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Truthy values rejection test', async () => {
        // Test truthy values - should not match expectFalsy()
        testsRunner.expect(true).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect(1).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect(-1).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect('hello').not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect('0').not.toEqual(testsRunner.expectFalsy()) // String '0' is truthy
        testsRunner.expect(' ').not.toEqual(testsRunner.expectFalsy()) // Space is truthy
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect([]).not.toEqual(testsRunner.expectFalsy()) // Empty array is truthy
        testsRunner.expect({}).not.toEqual(testsRunner.expectFalsy()) // Empty object is truthy
        testsRunner.expect(new Date()).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect(() => {}).not.toEqual(testsRunner.expectFalsy())
        testsRunner.expect(Symbol('test')).not.toEqual(testsRunner.expectFalsy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated falsy test', async () => {
        // Truthy values should match not.expectFalsy()
        testsRunner.expect(true).toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(1).toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect('hello').toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect([]).toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect({}).toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(Infinity).toEqual(testsRunner.not.expectFalsy())

        // Falsy values should not match not.expectFalsy()
        testsRunner.expect(false).not.toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(0).not.toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect('').not.toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(null).not.toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(undefined).not.toEqual(testsRunner.not.expectFalsy())
        testsRunner.expect(NaN).not.toEqual(testsRunner.not.expectFalsy())
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectFalsy', async () => {
        const apiResponse = {
          success: true, // truthy
          error: null, // falsy
          data: {
            items: [], // truthy (arrays are always truthy)
            count: 0, // falsy
            hasMore: false, // falsy
            nextPage: undefined, // falsy
            message: '' // falsy
          },
          metadata: {
            cached: true, // truthy
            expires: NaN // falsy
          }
        }

        testsRunner.expect(apiResponse).toMatchObject({
          success: testsRunner.not.expectFalsy(), // Should be truthy
          error: testsRunner.expectFalsy(), // Should be falsy (null)
          data: {
            items: testsRunner.not.expectFalsy(), // Should be truthy (array)
            count: testsRunner.expectFalsy(), // Should be falsy (0)
            hasMore: testsRunner.expectFalsy(), // Should be falsy (false)
            nextPage: testsRunner.expectFalsy(), // Should be falsy (undefined)
            message: testsRunner.expectFalsy() // Should be falsy (empty string)
          },
          metadata: {
            cached: testsRunner.not.expectFalsy(), // Should be truthy
            expires: testsRunner.expectFalsy() // Should be falsy (NaN)
          }
        })

        // Test with array containing falsy values
        const flags = [true, false, 0, 1, '', 'text', null, undefined]

        testsRunner.expect(flags).toEqual([
          testsRunner.not.expectFalsy(), // true
          testsRunner.expectFalsy(), // false
          testsRunner.expectFalsy(), // 0
          testsRunner.not.expectFalsy(), // 1
          testsRunner.expectFalsy(), // ''
          testsRunner.not.expectFalsy(), // 'text'
          testsRunner.expectFalsy(), // null
          testsRunner.expectFalsy() // undefined
        ])
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test edge cases that might be confusing
        testsRunner.expect(0).toEqual(testsRunner.expectFalsy()) // 0 is falsy
        testsRunner.expect(-0).toEqual(testsRunner.expectFalsy()) // -0 is falsy
        testsRunner.expect('0').not.toEqual(testsRunner.expectFalsy()) // '0' string is truthy
        testsRunner.expect(false).toEqual(testsRunner.expectFalsy()) // false is falsy
        testsRunner.expect('false').not.toEqual(testsRunner.expectFalsy()) // 'false' string is truthy
        testsRunner.expect([]).not.toEqual(testsRunner.expectFalsy()) // empty array is truthy
        testsRunner.expect({}).not.toEqual(testsRunner.expectFalsy()) // empty object is truthy
        testsRunner.expect(NaN).toEqual(testsRunner.expectFalsy()) // NaN is falsy
        testsRunner.expect(Infinity).not.toEqual(testsRunner.expectFalsy()) // Infinity is truthy
        testsRunner.expect(-Infinity).not.toEqual(testsRunner.expectFalsy()) // -Infinity is truthy
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
