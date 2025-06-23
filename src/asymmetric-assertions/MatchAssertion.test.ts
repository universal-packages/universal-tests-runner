import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function matchAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('MatchAssertion test', () => {
    selfTestsRunner.test('Should match strings against regex patterns', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String regex match test', async () => {
        // Test with simple patterns
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/hello/))
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/world/))
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/hello world/))
        testsRunner.expect('test123').toEqual(testsRunner.expectMatch(/\d+/))
        testsRunner.expect('abc123def').toEqual(testsRunner.expectMatch(/\d+/))

        // Test with case insensitive patterns
        testsRunner.expect('Hello World').toEqual(testsRunner.expectMatch(/hello/i))
        testsRunner.expect('HELLO WORLD').toEqual(testsRunner.expectMatch(/hello world/i))
        testsRunner.expect('HeLLo').toEqual(testsRunner.expectMatch(/hello/gi))

        // Test with start/end anchors
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/^hello/))
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/world$/))
        testsRunner.expect('hello world').toEqual(testsRunner.expectMatch(/^hello world$/))

        // Test with complex patterns
        testsRunner.expect('user@example.com').toEqual(testsRunner.expectMatch(/\w+@\w+\.\w+/))
        testsRunner.expect('2023-12-25').toEqual(testsRunner.expectMatch(/^\d{4}-\d{2}-\d{2}$/))
        testsRunner.expect('(555) 123-4567').toEqual(testsRunner.expectMatch(/\(\d{3}\)\s\d{3}-\d{4}/))

        // Test with special characters
        testsRunner.expect('Price: $29.99').toEqual(testsRunner.expectMatch(/\$\d+\.\d{2}/))
        testsRunner.expect('Question?').toEqual(testsRunner.expectMatch(/\?$/))
        testsRunner.expect('[1, 2, 3]').toEqual(testsRunner.expectMatch(/\[.*\]/))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match strings that do not match pattern', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String regex no match test', async () => {
        // Test non-matching patterns
        testsRunner.expect('hello world').not.toEqual(testsRunner.expectMatch(/goodbye/))
        testsRunner.expect('hello world').not.toEqual(testsRunner.expectMatch(/^\d+$/))
        testsRunner.expect('abc').not.toEqual(testsRunner.expectMatch(/\d+/))

        // Test case sensitivity
        testsRunner.expect('Hello World').not.toEqual(testsRunner.expectMatch(/hello/)) // Case sensitive
        testsRunner.expect('HELLO').not.toEqual(testsRunner.expectMatch(/hello/))

        // Test exact matching
        testsRunner.expect('hello world!').not.toEqual(testsRunner.expectMatch(/^hello world$/))
        testsRunner.expect(' hello world').not.toEqual(testsRunner.expectMatch(/^hello world$/))

        // Test with invalid email patterns
        testsRunner.expect('invalid-email').not.toEqual(testsRunner.expectMatch(/\w+@\w+\.\w+/))
        testsRunner.expect('user@').not.toEqual(testsRunner.expectMatch(/\w+@\w+\.\w+/))
        testsRunner.expect('@example.com').not.toEqual(testsRunner.expectMatch(/\w+@\w+\.\w+/))

        // Empty string should not match non-empty patterns
        testsRunner.expect('').not.toEqual(testsRunner.expectMatch(/\w+/))
        testsRunner.expect('').not.toEqual(testsRunner.expectMatch(/./))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-string values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-string match test', async () => {
        // Numbers should not match (only strings are supported)
        testsRunner.expect(123).not.toEqual(testsRunner.expectMatch(/123/))
        testsRunner.expect(456.789).not.toEqual(testsRunner.expectMatch(/456\.789/))
        testsRunner.expect(42).not.toEqual(testsRunner.expectMatch(/\d+/))

        // Boolean values should not match (only strings are supported)
        testsRunner.expect(true).not.toEqual(testsRunner.expectMatch(/true/))
        testsRunner.expect(false).not.toEqual(testsRunner.expectMatch(/false/))
        testsRunner.expect(true).not.toEqual(testsRunner.expectMatch(/false/))

        // null and undefined should not match
        testsRunner.expect(null).not.toEqual(testsRunner.expectMatch(/null/))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectMatch(/undefined/))
        testsRunner.expect(null).not.toEqual(testsRunner.expectMatch(/.+/))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectMatch(/.+/))

        // Objects should not match
        testsRunner.expect({}).not.toEqual(testsRunner.expectMatch(/object/))
        testsRunner.expect([]).not.toEqual(testsRunner.expectMatch(/array/))
        testsRunner.expect({ name: 'test' }).not.toEqual(testsRunner.expectMatch(/test/))

        // But non-strings should match not.expectMatch() (negated version)
        testsRunner.expect(123).toEqual(testsRunner.not.expectMatch(/123/))
        testsRunner.expect(true).toEqual(testsRunner.not.expectMatch(/true/))
        testsRunner.expect(null).toEqual(testsRunner.not.expectMatch(/anything/))
        testsRunner.expect({}).toEqual(testsRunner.not.expectMatch(/anything/))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated match test', async () => {
        // Strings that don't match should match not.expectMatch()
        testsRunner.expect('hello world').toEqual(testsRunner.not.expectMatch(/goodbye/))
        testsRunner.expect('abc').toEqual(testsRunner.not.expectMatch(/\d+/))
        testsRunner.expect('Hello').toEqual(testsRunner.not.expectMatch(/hello/)) // Case sensitive
        testsRunner.expect('invalid-email').toEqual(testsRunner.not.expectMatch(/\w+@\w+\.\w+/))

        // Strings that do match should not match not.expectMatch()
        testsRunner.expect('hello world').not.toEqual(testsRunner.not.expectMatch(/hello/))
        testsRunner.expect('test123').not.toEqual(testsRunner.not.expectMatch(/\d+/))
        testsRunner.expect('user@example.com').not.toEqual(testsRunner.not.expectMatch(/\w+@\w+\.\w+/))

        // Edge cases with negation
        testsRunner.expect('').toEqual(testsRunner.not.expectMatch(/\w+/))
        testsRunner.expect('anything').not.toEqual(testsRunner.not.expectMatch(/.+/))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectMatch', async () => {
        const logEntry = {
          timestamp: '2023-12-25T10:30:45.123Z',
          level: 'ERROR',
          message: 'Database connection failed: Connection timeout after 5000ms',
          metadata: {
            service: 'user-service',
            version: 'v1.2.3',
            requestId: 'req-abc123-def456',
            userId: 'user-789',
            errorCode: 'DB_TIMEOUT'
          },
          tags: ['database', 'error', 'timeout'],
          stackTrace: 'Error: Connection timeout\n    at Database.connect (db.js:42:15)\n    at UserService.getUser (user.js:28:10)'
        }

        // Test log entry format validation
        testsRunner.expect(logEntry).toMatchObject({
          timestamp: testsRunner.expectMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/), // ISO timestamp
          level: testsRunner.expectMatch(/^(DEBUG|INFO|WARN|ERROR)$/), // Log level
          message: testsRunner.expectMatch(/timeout/i), // Contains 'timeout'
          metadata: {
            service: testsRunner.expectMatch(/-service$/), // Ends with '-service'
            version: testsRunner.expectMatch(/^v\d+\.\d+\.\d+$/), // Semantic version
            requestId: testsRunner.expectMatch(/^req-[a-f0-9]+-[a-f0-9]+$/), // Request ID format
            userId: testsRunner.expectMatch(/^user-\d+$/), // User ID format
            errorCode: testsRunner.expectMatch(/^[A-Z_]+$/) // Error code format
          }
        })

        // Test API response format
        const apiResponse = {
          status: 'success',
          data: {
            user: {
              id: 'usr_abc123def456',
              email: 'john.doe@company.com',
              phone: '+1-555-123-4567',
              createdAt: '2023-01-15',
              profile: {
                username: 'john_doe_2023',
                displayName: 'John Doe'
              }
            }
          },
          meta: {
            requestId: 'api-req-789xyz',
            processingTime: '245ms',
            version: '2.1.0'
          }
        }

        testsRunner.expect(apiResponse).toMatchObject({
          status: testsRunner.expectMatch(/^(success|error)$/),
          data: {
            user: {
              id: testsRunner.expectMatch(/^usr_[a-f0-9]+$/),
              email: testsRunner.expectMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
              phone: testsRunner.expectMatch(/^\+\d{1}-\d{3}-\d{3}-\d{4}$/),
              createdAt: testsRunner.expectMatch(/^\d{4}-\d{2}-\d{2}$/),
              profile: {
                username: testsRunner.expectMatch(/^[a-z_0-9]+$/),
                displayName: testsRunner.expectMatch(/^[A-Za-z\s]+$/)
              }
            }
          },
          meta: {
            requestId: testsRunner.expectMatch(/^api-req-[a-z0-9]+$/),
            processingTime: testsRunner.expectMatch(/^\d+ms$/),
            version: testsRunner.expectMatch(/^\d+\.\d+\.\d+$/)
          }
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with empty regex pattern
        testsRunner.expect('anything').toEqual(testsRunner.expectMatch(/(?:)/))
        testsRunner.expect('').toEqual(testsRunner.expectMatch(/(?:)/))

        // Test with patterns that match empty strings
        testsRunner.expect('').toEqual(testsRunner.expectMatch(/^$/))
        testsRunner.expect('non-empty').not.toEqual(testsRunner.expectMatch(/^$/))

        // Test with global flag (should still work)
        testsRunner.expect('hello hello hello').toEqual(testsRunner.expectMatch(/hello/g))
        testsRunner.expect('abc 123 def 456').toEqual(testsRunner.expectMatch(/\d+/g))

        // Test with multiline flag
        testsRunner.expect('line1\nline2').toEqual(testsRunner.expectMatch(/^line2$/m))
        testsRunner.expect('line1\nline2').not.toEqual(testsRunner.expectMatch(/^line2$/)) // Without multiline

        // Test with very long strings
        const longString = 'a'.repeat(10000) + 'needle' + 'b'.repeat(10000)
        testsRunner.expect(longString).toEqual(testsRunner.expectMatch(/needle/))
        testsRunner.expect(longString).toEqual(testsRunner.expectMatch(/^a+needle/))

        // Test with special Unicode characters
        testsRunner.expect('café').toEqual(testsRunner.expectMatch(/café/))
        testsRunner.expect('🚀 rocket').toEqual(testsRunner.expectMatch(/🚀/))
        testsRunner.expect('Ñoño').toEqual(testsRunner.expectMatch(/Ñ/))

        // Test with escape sequences in strings
        testsRunner.expect('line1\nline2').toEqual(testsRunner.expectMatch(/line1\nline2/))
        testsRunner.expect('tab\there').toEqual(testsRunner.expectMatch(/tab\there/))
        testsRunner.expect('quote"here').toEqual(testsRunner.expectMatch(/quote"here/))

        // Test with regex special characters in the string
        testsRunner.expect('$100.50').toEqual(testsRunner.expectMatch(/\$\d+\.\d+/))
        testsRunner.expect('[array]').toEqual(testsRunner.expectMatch(/\[array\]/))
        testsRunner.expect('(parentheses)').toEqual(testsRunner.expectMatch(/\(parentheses\)/))
        testsRunner.expect('question?').toEqual(testsRunner.expectMatch(/question\?/))
        testsRunner.expect('star*').toEqual(testsRunner.expectMatch(/star\*/))
        testsRunner.expect('plus+').toEqual(testsRunner.expectMatch(/plus\+/))

        // Test with very complex patterns
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        testsRunner.expect('192.168.1.1').toEqual(testsRunner.expectMatch(ipPattern))
        testsRunner.expect('255.255.255.255').toEqual(testsRunner.expectMatch(ipPattern))
        testsRunner.expect('256.1.1.1').not.toEqual(testsRunner.expectMatch(ipPattern))
        testsRunner.expect('192.168.1').not.toEqual(testsRunner.expectMatch(ipPattern))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
