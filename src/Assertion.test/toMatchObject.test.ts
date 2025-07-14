import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toMatchObjectTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toMatchObject assertion test', () => {
    selfTestsRunner.test('Should pass when objects match exactly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Exact object match test', async () => {
        const expected = { name: 'test', value: 42 }
        const actual = { name: 'test', value: 42 }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when actual object has additional properties', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Partial object match test', async () => {
        const expected = { name: 'test', value: 42 }
        const actual = { name: 'test', value: 42, extra: 'property' }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when objects do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object mismatch test', async () => {
        const expected = { name: 'test', value: 42 }
        const actual = { name: 'test', value: 43 }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to match {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'Object'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not an object', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-object value test', async () => {
        testsRunner.expect('not an object').toMatchObject({ name: 'test' })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be an object')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'string',
          representation: "'not an object'"
        }
      })
    })

    selfTestsRunner.test('Should fail when value is null', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null value test', async () => {
        testsRunner.expect(null).toMatchObject({ name: 'test' })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be an object')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'null',
          representation: 'null'
        }
      })
    })

    selfTestsRunner.test('Should pass with nested objects that match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nested object match test', async () => {
        const expected = {
          user: { name: 'test', age: 25 },
          settings: { theme: 'dark' }
        }
        const actual = {
          user: { name: 'test', age: 25 },
          settings: { theme: 'dark' }
        }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass with nested objects when actual has extra properties', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nested object partial match test', async () => {
        const expected = {
          user: { name: 'test' },
          settings: { theme: 'dark' }
        }
        const actual = {
          user: { name: 'test', age: 25, email: 'test@example.com' },
          settings: { theme: 'dark', language: 'en' },
          extra: 'property'
        }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with nested objects that do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nested object mismatch test', async () => {
        const expected = {
          user: { name: 'test', age: 25 },
          settings: { theme: 'dark' }
        }
        const actual = {
          user: { name: 'test', age: 26 },
          settings: { theme: 'dark' }
        }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with arrays that match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array match test', async () => {
        const expected = { items: [1, 2, 3] }
        const actual = { items: [1, 2, 3] }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass with arrays when actual has extra elements', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array partial match test', async () => {
        const expected = { items: [1, 2] }
        const actual = { items: [1, 2, 3, 4] }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with arrays that do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array mismatch test', async () => {
        const expected = { items: [1, 2, 3] }
        const actual = { items: [1, 2, 4] }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toMatchObject when objects do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toMatchObject test', async () => {
        const expected = { name: 'test', value: 42 }
        const actual = { name: 'test', value: 43 }

        testsRunner.expect(actual).not.toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toMatchObject when objects match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toMatchObject test', async () => {
        const expected = { name: 'test', value: 42 }
        const actual = { name: 'test', value: 42 }

        testsRunner.expect(actual).not.toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to match {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'instanceOf',
          representation: 'Object'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should fail with not.toMatchObject when objects match partially', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toMatchObject partial match test', async () => {
        const expected = { name: 'test' }
        const actual = { name: 'test', value: 42 }

        testsRunner.expect(actual).not.toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle empty objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Empty object test', async () => {
        const expected = {}
        const actual = { name: 'test', value: 42 }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle objects with different types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different types test', async () => {
        const expected = {
          string: 'test',
          number: 42,
          boolean: true,
          nullValue: null,
          undefinedValue: undefined
        }
        const actual = {
          string: 'test',
          number: 42,
          boolean: true,
          nullValue: null,
          undefinedValue: undefined,
          extra: 'property'
        }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when types do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Type mismatch test', async () => {
        const expected = { value: 42 }
        const actual = { value: '42' }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle complex nested structures', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex nested structure test', async () => {
        const expected = {
          users: [
            { name: 'user1', permissions: { read: true } },
            { name: 'user2', permissions: { write: true } }
          ],
          settings: {
            app: { theme: 'dark', version: '1.0' }
          }
        }
        const actual = {
          users: [
            { name: 'user1', permissions: { read: true, admin: false } },
            { name: 'user2', permissions: { write: true, admin: true } }
          ],
          settings: {
            app: { theme: 'dark', version: '1.0', language: 'en' },
            extra: 'setting'
          },
          metadata: { created: new Date() }
        }

        testsRunner.expect(actual).toMatchObject(expected)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
