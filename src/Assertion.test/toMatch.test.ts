import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toMatchTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toMatch assertion test', () => {
    selfTestsRunner.test('Should pass when string matches regex pattern', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String matches regex test', async () => {
        testsRunner.expect('hello world').toMatch(/hello/)
        testsRunner.expect('hello world').toMatch(/world/)
        testsRunner.expect('hello world').toMatch(/hello world/)
        testsRunner.expect('test123').toMatch(/\d+/)
        testsRunner.expect('email@domain.com').toMatch(/@/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when string matches regex pattern (case insensitive)', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Case insensitive regex test', async () => {
        testsRunner.expect('Hello World').toMatch(/hello/i)
        testsRunner.expect('HELLO').toMatch(/hello/i)
        testsRunner.expect('Test').toMatch(/test/i)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when string does not match regex pattern', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String does not match regex test', async () => {
        testsRunner.expect('hello world').toMatch(/goodbye/)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to match {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'RegExp'
        },
        actual: {
          type: 'string',
          representation: "'hello world'"
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-string value test', async () => {
        testsRunner.expect(123).toMatch(/\d+/)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a string')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'number',
          representation: '123'
        }
      })
    })

    selfTestsRunner.test('Should handle different non-string types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toMatch(/test/)
      })

      testsRunner.test('Array test', async () => {
        testsRunner.expect([]).toMatch(/test/)
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toMatch(/test/)
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail with non-string error
      tests.forEach((test) => {
        const error = test.failureReason as TestError
        selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a string')
      })
    })

    selfTestsRunner.test('Should work with not.toMatch for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toMatch test', async () => {
        testsRunner.expect('hello world').not.toMatch(/goodbye/)
        testsRunner.expect('hello world').not.toMatch(/xyz/)
        testsRunner.expect('123').not.toMatch(/[a-z]/)
        testsRunner.expect('').not.toMatch(/anything/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toMatch when pattern matches', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toMatch test', async () => {
        testsRunner.expect('hello world').not.toMatch(/hello/)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to match {{target}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'RegExp'
        },
        actual: {
          type: 'string',
          representation: "'hello world'"
        }
      })
    })

    selfTestsRunner.test('Should handle complex regex patterns', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex regex test', async () => {
        // Email pattern
        testsRunner.expect('user@example.com').toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

        // Phone pattern
        testsRunner.expect('123-456-7890').toMatch(/^\d{3}-\d{3}-\d{4}$/)

        // URL pattern
        testsRunner.expect('https://example.com').toMatch(/^https?:\/\//)

        // Word boundaries
        testsRunner.expect('hello world').toMatch(/\bhello\b/)
        testsRunner.expect('hello world').toMatch(/\bworld\b/)

        // Quantifiers
        testsRunner.expect('aaaa').toMatch(/a{4}/)
        testsRunner.expect('abc123def').toMatch(/\d+/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Empty string
        testsRunner.expect('').toMatch(/^$/)
        testsRunner.expect('').not.toMatch(/.+/)

        // Whitespace
        testsRunner.expect('   ').toMatch(/\s+/)
        testsRunner.expect('\t\n').toMatch(/\s/)

        // Special characters
        testsRunner.expect('$100').toMatch(/\$/)
        testsRunner.expect('(test)').toMatch(/\(.*\)/)
        testsRunner.expect('[brackets]').toMatch(/\[.*\]/)

        // Global and multiline flags
        testsRunner.expect('hello\nworld').toMatch(/hello.*world/s)
        testsRunner.expect('Hello').toMatch(/hello/i)

        // Unicode
        testsRunner.expect('café').toMatch(/café/)
        testsRunner.expect('🌟').toMatch(/🌟/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle regex flags properly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Regex flags test', async () => {
        // Case insensitive flag
        testsRunner.expect('Hello').toMatch(/hello/i)
        testsRunner.expect('HELLO').toMatch(/hello/i)

        // Global flag (should still work for matching)
        testsRunner.expect('test test').toMatch(/test/g)

        // Multiline flag
        testsRunner.expect('line1\nline2').toMatch(/^line2$/m)

        // Dot all flag
        testsRunner.expect('hello\nworld').toMatch(/hello.world/s)

        // Combinations
        testsRunner.expect('Hello\nWORLD').toMatch(/hello.*world/is)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
