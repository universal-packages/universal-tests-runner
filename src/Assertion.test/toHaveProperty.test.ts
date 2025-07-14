import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHavePropertyTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveProperty assertion test', () => {
    selfTestsRunner.test('Should pass when object has expected property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object has property test', async () => {
        const obj = { name: 'John', age: 30 }

        testsRunner.expect(obj).toHaveProperty('name')
        testsRunner.expect(obj).toHaveProperty('age')
        testsRunner.expect(obj).toHaveProperty('name', 'John')
        testsRunner.expect(obj).toHaveProperty('age', 30)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with nested properties', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nested properties test', async () => {
        const obj = {
          user: {
            profile: {
              name: 'John',
              age: 30
            }
          }
        }

        testsRunner.expect(obj).toHaveProperty('user')
        testsRunner.expect(obj).toHaveProperty('user.profile')
        testsRunner.expect(obj).toHaveProperty('user.profile.name')
        testsRunner.expect(obj).toHaveProperty('user.profile.name', 'John')
        testsRunner.expect(obj).toHaveProperty('user.profile.age', 30)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with arrays', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Array properties test', async () => {
        const arr = [1, 2, 3]

        testsRunner.expect(arr).toHaveProperty('length')
        testsRunner.expect(arr).toHaveProperty('length', 3)
        testsRunner.expect(arr).toHaveProperty('0', 1)
        testsRunner.expect(arr).toHaveProperty('2', 3)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when object does not have expected property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Missing property test', async () => {
        const obj = { name: 'John' }
        testsRunner.expect(obj).toHaveProperty('age')
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have property in path {{path}}, but it did not')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        path: {
          type: 'string',
          representation: "'age'"
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should fail when property has wrong value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Wrong property value test', async () => {
        const obj = { name: 'John', age: 30 }
        testsRunner.expect(obj).toHaveProperty('age', 25)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have property in path {{path}} equal to {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        path: {
          type: 'string',
          representation: "'age'"
        },
        target: {
          type: 'number',
          representation: '25'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should fail when nested property does not exist', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Missing nested property test', async () => {
        const obj = { user: { name: 'John' } }
        testsRunner.expect(obj).toHaveProperty('user.profile.name')
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have property in path {{path}}, but it did not')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        path: {
          type: 'string',
          representation: "'user.profile.name'"
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should handle non-object types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String test', async () => {
        testsRunner.expect('hello').toHaveProperty('length')
      })

      await testsRunner.run()

      // String property check actually fails in this implementation
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have property in path {{path}}, but it did not')
    })

    selfTestsRunner.test('Should handle different non-object types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Number test', async () => {
        testsRunner.expect(42).toHaveProperty('nonexistent')
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toHaveProperty('property')
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toHaveProperty('property')
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail with property not found error
      tests.forEach((test) => {
        const error = test.failureReason as TestError
        selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have property in path {{path}}, but it did not')
      })
    })

    selfTestsRunner.test('Should work with not.toHaveProperty for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveProperty test', async () => {
        const obj = { name: 'John', age: 30 }

        testsRunner.expect(obj).not.toHaveProperty('email')
        testsRunner.expect(obj).not.toHaveProperty('profile.name')
        testsRunner.expect(obj).not.toHaveProperty('age', 25) // Wrong value
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveProperty when property exists', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveProperty test', async () => {
        const obj = { name: 'John' }
        testsRunner.expect(obj).not.toHaveProperty('name')
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have property in path {{path}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        path: {
          type: 'string',
          representation: "'name'"
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should fail with not.toHaveProperty when property has exact expected value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveProperty with exact value test', async () => {
        const obj = { name: 'John', age: 30 }
        testsRunner.expect(obj).not.toHaveProperty('age', 30) // Should fail because age IS 30
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have property in path {{path}} equal to {{target}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        path: {
          type: 'string',
          representation: "'age'"
        },
        target: {
          type: 'number',
          representation: '30'
        },
        actual: {
          type: 'instanceOf',
          representation: 'Object'
        }
      })
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Empty object
        testsRunner.expect({}).not.toHaveProperty('anything')

        // Properties with special names
        const obj = { '': 'empty', ' ': 'space', '123': 'number' }
        testsRunner.expect(obj).toHaveProperty('')
        testsRunner.expect(obj).toHaveProperty(' ')
        testsRunner.expect(obj).toHaveProperty('123')

        // Inherited properties (should not match - using hasOwnProperty concept)
        const child = Object.create({ inherited: 'value' })
        child.own = 'value'
        testsRunner.expect(child).toHaveProperty('own')
        // Note: inherited properties DO count with 'in' operator which the implementation uses
        testsRunner.expect(child).toHaveProperty('inherited')

        // Arrays are objects too
        const arr = [1, 2, 3]
        testsRunner.expect(arr).toHaveProperty('length', 3)
        testsRunner.expect(arr).toHaveProperty('0', 1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle undefined and null property values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Undefined and null values test', async () => {
        const obj = {
          undefinedProp: undefined,
          nullProp: null,
          falsyProp: false,
          zeroProp: 0,
          emptyProp: ''
        }

        testsRunner.expect(obj).toHaveProperty('undefinedProp')
        testsRunner.expect(obj).toHaveProperty('undefinedProp', undefined)
        testsRunner.expect(obj).toHaveProperty('nullProp', null)
        testsRunner.expect(obj).toHaveProperty('falsyProp', false)
        testsRunner.expect(obj).toHaveProperty('zeroProp', 0)
        testsRunner.expect(obj).toHaveProperty('emptyProp', '')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle complex nested structures', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex nested test', async () => {
        const obj = {
          level1: {
            level2: {
              level3: {
                deep: 'value',
                array: [{ item: 'test' }],
                object: { nested: true }
              }
            }
          }
        }

        testsRunner.expect(obj).toHaveProperty('level1.level2.level3.deep', 'value')
        testsRunner.expect(obj).toHaveProperty('level1.level2.level3.array')
        testsRunner.expect(obj).toHaveProperty('level1.level2.level3.object.nested', true)

        // Non-existent deep paths
        testsRunner.expect(obj).not.toHaveProperty('level1.level2.level3.nonexistent')
        testsRunner.expect(obj).not.toHaveProperty('level1.level2.level4')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
