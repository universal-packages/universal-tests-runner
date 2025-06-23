import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function containAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('ContainAssertion test', () => {
    selfTestsRunner.test('Should match arrays containing the expected item', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array contain test', async () => {
        // Basic array contains
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectContain(2))
        testsRunner.expect(['a', 'b', 'c']).toEqual(testsRunner.expectContain('b'))
        testsRunner.expect([true, false]).toEqual(testsRunner.expectContain(true))
        testsRunner.expect([null, undefined, 0]).toEqual(testsRunner.expectContain(null))
        testsRunner.expect([null, undefined, 0]).toEqual(testsRunner.expectContain(undefined))
        testsRunner.expect([null, undefined, 0]).toEqual(testsRunner.expectContain(0))

        // Complex objects in arrays
        const obj1 = { id: 1, name: 'test' }
        const obj2 = { id: 2, name: 'other' }
        testsRunner.expect([obj1, obj2]).toEqual(testsRunner.expectContain(obj1))

        // Mixed types
        testsRunner.expect([1, 'hello', true, null]).toEqual(testsRunner.expectContain('hello'))
        testsRunner.expect([1, 'hello', true, null]).toEqual(testsRunner.expectContain(1))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should match strings containing the expected substring', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String contain test', async () => {
        // Basic string contains
        testsRunner.expect('hello world').toEqual(testsRunner.expectContain('hello'))
        testsRunner.expect('hello world').toEqual(testsRunner.expectContain('world'))
        testsRunner.expect('hello world').toEqual(testsRunner.expectContain(' '))
        testsRunner.expect('hello world').toEqual(testsRunner.expectContain('lo wo'))

        // Case sensitive
        testsRunner.expect('Hello World').toEqual(testsRunner.expectContain('Hello'))
        testsRunner.expect('Hello World').not.toEqual(testsRunner.expectContain('hello'))

        // Empty string and special cases
        testsRunner.expect('test').toEqual(testsRunner.expectContain(''))
        testsRunner.expect('').toEqual(testsRunner.expectContain(''))
        testsRunner.expect('123').toEqual(testsRunner.expectContain('2'))
        testsRunner.expect('test\n\t').toEqual(testsRunner.expectContain('\n'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match when item is not contained', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not contain test', async () => {
        // Arrays that don't contain the item
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.expectContain(4))
        testsRunner.expect(['a', 'b', 'c']).not.toEqual(testsRunner.expectContain('d'))
        testsRunner.expect([true]).not.toEqual(testsRunner.expectContain(false))
        testsRunner.expect([]).not.toEqual(testsRunner.expectContain('anything'))

        // Strings that don't contain the substring
        testsRunner.expect('hello').not.toEqual(testsRunner.expectContain('world'))
        testsRunner.expect('test').not.toEqual(testsRunner.expectContain('TEST'))
        testsRunner.expect('').not.toEqual(testsRunner.expectContain('x'))
        testsRunner.expect('abc').not.toEqual(testsRunner.expectContain('xyz'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match non-array/non-string values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Invalid types test', async () => {
        // Non-array/non-string values should not match
        testsRunner.expect(123).not.toEqual(testsRunner.expectContain(1))
        testsRunner.expect(true).not.toEqual(testsRunner.expectContain(true))
        testsRunner.expect(null).not.toEqual(testsRunner.expectContain(null))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectContain(undefined))
        testsRunner.expect({}).not.toEqual(testsRunner.expectContain('key'))
        testsRunner.expect({ a: 1, b: 2 }).not.toEqual(testsRunner.expectContain(1))
        testsRunner.expect(new Date()).not.toEqual(testsRunner.expectContain('2024'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated contain test', async () => {
        // Arrays that don't contain should match not.expectContain()
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.not.expectContain(4))
        testsRunner.expect(['a', 'b']).toEqual(testsRunner.not.expectContain('c'))
        testsRunner.expect([]).toEqual(testsRunner.not.expectContain('anything'))

        // Strings that don't contain should match not.expectContain()
        testsRunner.expect('hello').toEqual(testsRunner.not.expectContain('world'))
        testsRunner.expect('test').toEqual(testsRunner.not.expectContain('xyz'))

        // Arrays/strings that do contain should not match not.expectContain()
        testsRunner.expect([1, 2, 3]).not.toEqual(testsRunner.not.expectContain(2))
        testsRunner.expect('hello world').not.toEqual(testsRunner.not.expectContain('world'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectContain', async () => {
        const apiData = {
          users: ['alice', 'bob', 'charlie'],
          tags: ['javascript', 'testing', 'nodejs'],
          permissions: ['read', 'write'],
          message: 'Welcome to our platform!',
          errors: [],
          settings: {
            languages: ['en', 'es', 'fr'],
            theme: 'dark mode'
          }
        }

        testsRunner.expect(apiData).toMatchObject({
          users: testsRunner.expectContain('alice'),
          tags: testsRunner.expectContain('testing'),
          permissions: testsRunner.expectContain('read'),
          message: testsRunner.expectContain('Welcome'),
          errors: testsRunner.not.expectContain('any error'), // Empty array
          settings: {
            languages: testsRunner.expectContain('en'),
            theme: testsRunner.expectContain('dark')
          }
        })

        // Test with nested arrays containing objects (reference equality)
        const comment1 = { author: 'john', message: 'Great post!' }
        const comment2 = { author: 'jane', message: 'Very helpful, thanks!' }
        const blogPost = {
          title: 'Understanding Asymmetric Assertions',
          tags: ['testing', 'javascript', 'assertions'],
          comments: [comment1, comment2]
        }

        testsRunner.expect(blogPost).toMatchObject({
          title: testsRunner.expectContain('Asymmetric'),
          tags: testsRunner.expectContain('javascript'),
          comments: testsRunner.expectContain(comment1) // Reference equality
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Special array values - NaN never equals NaN, so this should not match
        testsRunner.expect([NaN]).not.toEqual(testsRunner.expectContain(NaN))
        testsRunner.expect([Infinity]).toEqual(testsRunner.expectContain(Infinity))
        testsRunner.expect([0, -0]).toEqual(testsRunner.expectContain(0))
        testsRunner.expect([0, -0]).toEqual(testsRunner.expectContain(-0))

        // String edge cases
        testsRunner.expect('null').toEqual(testsRunner.expectContain('null'))
        testsRunner.expect('undefined').toEqual(testsRunner.expectContain('undefined'))
        testsRunner.expect('0').toEqual(testsRunner.expectContain('0'))
        testsRunner.expect('false').toEqual(testsRunner.expectContain('false'))

        // Unicode and special characters
        testsRunner.expect('café').toEqual(testsRunner.expectContain('é'))
        testsRunner.expect('🚀 rocket').toEqual(testsRunner.expectContain('🚀'))
        testsRunner.expect('line1\nline2').toEqual(testsRunner.expectContain('\n'))
        testsRunner.expect('tab\there').toEqual(testsRunner.expectContain('\t'))

        // Array with complex nested values (reference equality)
        const arr1 = [1, 2]
        const arr2 = [3, 4]
        const nested = [arr1, arr2]
        testsRunner.expect(nested).toEqual(testsRunner.expectContain(arr1))
        testsRunner.expect(nested).toEqual(testsRunner.expectContain(arr2))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
