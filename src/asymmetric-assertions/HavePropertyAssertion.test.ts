import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function havePropertyAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('HavePropertyAssertion test', () => {
    selfTestsRunner.test('Should match objects with specified property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object has property test', async () => {
        // Test with simple objects
        testsRunner.expect({ name: 'Alice', age: 25 }).toEqual(testsRunner.expectHaveProperty('name'))
        testsRunner.expect({ name: 'Alice', age: 25 }).toEqual(testsRunner.expectHaveProperty('age'))
        testsRunner.expect({ a: 1, b: 2, c: 3 }).toEqual(testsRunner.expectHaveProperty('b'))

        // Test with nested properties using dot notation
        testsRunner
          .expect({
            user: { profile: { name: 'Bob', email: 'bob@example.com' } }
          })
          .toEqual(testsRunner.expectHaveProperty('user.profile.name'))

        testsRunner
          .expect({
            user: { profile: { name: 'Bob', email: 'bob@example.com' } }
          })
          .toEqual(testsRunner.expectHaveProperty('user.profile.email'))

        // Test with array indices in property paths
        testsRunner
          .expect({
            items: ['apple', 'banana', 'cherry']
          })
          .toEqual(testsRunner.expectHaveProperty('items.0'))

        testsRunner
          .expect({
            items: ['apple', 'banana', 'cherry']
          })
          .toEqual(testsRunner.expectHaveProperty('items.2'))

        // Test with properties that have falsy values
        testsRunner
          .expect({
            name: '',
            count: 0,
            active: false,
            data: null
          })
          .toEqual(testsRunner.expectHaveProperty('name'))
        testsRunner
          .expect({
            name: '',
            count: 0,
            active: false,
            data: null
          })
          .toEqual(testsRunner.expectHaveProperty('count'))
        testsRunner
          .expect({
            name: '',
            count: 0,
            active: false,
            data: null
          })
          .toEqual(testsRunner.expectHaveProperty('active'))
        testsRunner
          .expect({
            name: '',
            count: 0,
            active: false,
            data: null
          })
          .toEqual(testsRunner.expectHaveProperty('data'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match objects without specified property', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object does not have property test', async () => {
        // Test with objects missing the property
        testsRunner.expect({ name: 'Alice', age: 25 }).not.toEqual(testsRunner.expectHaveProperty('email'))
        testsRunner.expect({ a: 1, b: 2 }).not.toEqual(testsRunner.expectHaveProperty('c'))
        testsRunner.expect({}).not.toEqual(testsRunner.expectHaveProperty('anything'))

        // Test with nested properties that don't exist
        testsRunner
          .expect({
            user: { name: 'Bob' }
          })
          .not.toEqual(testsRunner.expectHaveProperty('user.profile.email'))

        testsRunner
          .expect({
            user: { profile: { name: 'Bob' } }
          })
          .not.toEqual(testsRunner.expectHaveProperty('user.profile.email'))

        // Test with array indices that don't exist
        testsRunner
          .expect({
            items: ['apple', 'banana']
          })
          .not.toEqual(testsRunner.expectHaveProperty('items.2'))

        testsRunner
          .expect({
            items: []
          })
          .not.toEqual(testsRunner.expectHaveProperty('items.0'))

        // Test with property that exists on prototype but not on object itself
        const obj = Object.create({ inherited: 'value' })
        // Note: The `in` operator checks the prototype chain, so inherited properties ARE found
        testsRunner.expect(obj).toEqual(testsRunner.expectHaveProperty('inherited'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-object values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-object property test', async () => {
        // Arrays are objects and should work
        testsRunner.expect(['a', 'b', 'c']).toEqual(testsRunner.expectHaveProperty('0'))
        testsRunner.expect(['a', 'b', 'c']).toEqual(testsRunner.expectHaveProperty('length'))
        testsRunner.expect(['a', 'b', 'c']).not.toEqual(testsRunner.expectHaveProperty('3'))

        // Strings should not match property expectations (primitive values)
        testsRunner.expect('hello').not.toEqual(testsRunner.expectHaveProperty('length'))
        testsRunner.expect('hello').not.toEqual(testsRunner.expectHaveProperty('0'))

        // Numbers should not match
        testsRunner.expect(123).not.toEqual(testsRunner.expectHaveProperty('toString'))
        testsRunner.expect(123).not.toEqual(testsRunner.expectHaveProperty('anything'))

        // null and undefined should not match
        testsRunner.expect(null).not.toEqual(testsRunner.expectHaveProperty('anything'))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectHaveProperty('anything'))

        // Booleans should not match
        testsRunner.expect(true).not.toEqual(testsRunner.expectHaveProperty('anything'))
        testsRunner.expect(false).not.toEqual(testsRunner.expectHaveProperty('anything'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated have property test', async () => {
        // Objects without the property should match not.expectHaveProperty()
        testsRunner.expect({ name: 'Alice' }).toEqual(testsRunner.not.expectHaveProperty('age'))
        testsRunner.expect({}).toEqual(testsRunner.not.expectHaveProperty('anything'))
        testsRunner.expect({ a: 1 }).toEqual(testsRunner.not.expectHaveProperty('b'))

        // Objects with the property should not match not.expectHaveProperty()
        testsRunner.expect({ name: 'Alice', age: 25 }).not.toEqual(testsRunner.not.expectHaveProperty('name'))
        testsRunner.expect({ name: 'Alice', age: 25 }).not.toEqual(testsRunner.not.expectHaveProperty('age'))

        // Nested property negation
        testsRunner
          .expect({
            user: { name: 'Bob' }
          })
          .toEqual(testsRunner.not.expectHaveProperty('user.email'))
        testsRunner
          .expect({
            user: { name: 'Bob', email: 'bob@example.com' }
          })
          .not.toEqual(testsRunner.not.expectHaveProperty('user.email'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectHaveProperty', async () => {
        const userProfile = {
          id: 123,
          personal: {
            name: 'John Doe',
            email: 'john@example.com',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              coordinates: {
                lat: 40.7128,
                lng: -74.006
              }
            }
          },
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              push: false,
              sms: true
            }
          },
          activity: {
            lastLogin: new Date('2023-01-01'),
            loginCount: 150,
            achievements: ['early-adopter', 'power-user', 'contributor']
          }
        }

        // Test that the user profile has expected top-level and nested properties
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('id'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('personal.name'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('personal.email'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('personal.address.street'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('personal.address.coordinates.lat'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('preferences.notifications.email'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('activity.achievements.0'))
        testsRunner.expect(userProfile).toEqual(testsRunner.expectHaveProperty('activity.achievements.2'))

        // Test that it doesn't have properties that don't exist
        testsRunner.expect(userProfile).not.toEqual(testsRunner.expectHaveProperty('password'))
        testsRunner.expect(userProfile).not.toEqual(testsRunner.expectHaveProperty('personal.phone'))
        testsRunner.expect(userProfile).not.toEqual(testsRunner.expectHaveProperty('personal.address.zipCode'))
        testsRunner.expect(userProfile).not.toEqual(testsRunner.expectHaveProperty('activity.achievements.3'))

        // Test with API response structure
        const apiResponse = {
          success: true,
          data: {
            users: [
              { id: 1, name: 'Alice', roles: ['admin', 'user'] },
              { id: 2, name: 'Bob', roles: ['user'] }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 2,
              hasNext: false
            }
          },
          meta: {
            timestamp: Date.now(),
            version: '1.0.0'
          }
        }

        // Verify API response structure
        testsRunner.expect(apiResponse).toMatchObject({
          data: {
            users: testsRunner.expectHaveProperty('0.id'),
            pagination: testsRunner.expectHaveProperty('hasNext')
          },
          meta: testsRunner.expectHaveProperty('timestamp')
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with simple special property names
        const specialObj = {
          '': 'empty string property',
          ' ': 'space property',
          '123': 'numeric string property'
        }

        testsRunner.expect(specialObj).toEqual(testsRunner.expectHaveProperty(''))
        testsRunner.expect(specialObj).toEqual(testsRunner.expectHaveProperty(' '))
        testsRunner.expect(specialObj).toEqual(testsRunner.expectHaveProperty('123'))

        // Test with array-like objects
        const arrayLike = {
          0: 'first',
          1: 'second',
          length: 3
        }

        testsRunner.expect(arrayLike).toEqual(testsRunner.expectHaveProperty('0'))
        testsRunner.expect(arrayLike).toEqual(testsRunner.expectHaveProperty('length'))
        testsRunner.expect(arrayLike).not.toEqual(testsRunner.expectHaveProperty('3'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle null or undefined in property path traversal', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Property path with null/undefined test', async () => {
        // Test when path traversal encounters null
        const objWithNull = { user: null }
        testsRunner.expect(objWithNull).not.toEqual(testsRunner.expectHaveProperty('user.name'))

        // Test when path traversal encounters undefined
        const objWithUndefined = { user: undefined }
        testsRunner.expect(objWithUndefined).not.toEqual(testsRunner.expectHaveProperty('user.name'))

        // Test when path traversal encounters non-object primitive
        const objWithPrimitive = { user: 'string' }
        testsRunner.expect(objWithPrimitive).not.toEqual(testsRunner.expectHaveProperty('user.name'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with property value validation and negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Property value validation with negation test', async () => {
        const obj = { user: { name: 'John', age: 30 } }

        // Test negated property value matching - should pass when values don't match
        testsRunner.expect(obj).toEqual(testsRunner.not.expectHaveProperty('user.name', 'Jane'))
        testsRunner.expect(obj).toEqual(testsRunner.not.expectHaveProperty('user.age', 25))

        // Test negated property value matching - should fail when values do match
        testsRunner.expect(obj).not.toEqual(testsRunner.not.expectHaveProperty('user.name', 'John'))
        testsRunner.expect(obj).not.toEqual(testsRunner.not.expectHaveProperty('user.age', 30))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle property value mismatches without negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Property value mismatch without negation test', async () => {
        const obj = { user: { name: 'John', age: 30 } }

        // Test property value mismatches without negation - should not match
        testsRunner.expect(obj).not.toEqual(testsRunner.expectHaveProperty('user.name', 'Jane'))
        testsRunner.expect(obj).not.toEqual(testsRunner.expectHaveProperty('user.age', 25))

        // Test property value matches without negation - should match
        testsRunner.expect(obj).toEqual(testsRunner.expectHaveProperty('user.name', 'John'))
        testsRunner.expect(obj).toEqual(testsRunner.expectHaveProperty('user.age', 30))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-object values with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-object values with negation test', async () => {
        // Non-object values should match not.expectHaveProperty() (negated true case)
        testsRunner.expect('string').toEqual(testsRunner.not.expectHaveProperty('length'))
        testsRunner.expect(42).toEqual(testsRunner.not.expectHaveProperty('toString'))
        testsRunner.expect(true).toEqual(testsRunner.not.expectHaveProperty('valueOf'))
        testsRunner.expect(null).toEqual(testsRunner.not.expectHaveProperty('anything'))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectHaveProperty('anything'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
