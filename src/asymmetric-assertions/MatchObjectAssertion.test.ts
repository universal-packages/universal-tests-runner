import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function matchObjectAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('MatchObjectAssertion test', () => {
    selfTestsRunner.test('Should match objects with partial structure', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object partial match test', async () => {
        const fullObject = {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          profile: {
            age: 25,
            address: {
              city: 'New York',
              zipCode: '10001'
            },
            preferences: {
              theme: 'dark',
              notifications: true
            }
          },
          tags: ['user', 'active', 'premium'],
          metadata: {
            createdAt: '2023-01-01',
            updatedAt: '2023-12-25'
          }
        }

        // Test partial matching at root level
        testsRunner.expect(fullObject).toEqual(
          testsRunner.expectMatchObject({
            id: 1,
            name: 'Alice'
          })
        )

        // Test partial matching with nested objects
        testsRunner.expect(fullObject).toEqual(
          testsRunner.expectMatchObject({
            profile: {
              age: 25,
              address: {
                city: 'New York'
              }
            }
          })
        )

        // Test partial matching with arrays
        testsRunner.expect(fullObject).toEqual(
          testsRunner.expectMatchObject({
            tags: ['user', 'active', 'premium']
          })
        )

        // Test partial matching can ignore extra properties
        testsRunner.expect(fullObject).toEqual(
          testsRunner.expectMatchObject({
            id: 1,
            email: 'alice@example.com',
            profile: {
              preferences: {
                theme: 'dark'
              }
            }
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match objects with wrong values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object wrong values test', async () => {
        const testObject = {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          profile: {
            age: 25,
            active: true
          }
        }

        // Test with wrong values at root level
        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            id: 2 // Wrong ID
          })
        )

        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            name: 'Bob' // Wrong name
          })
        )

        // Test with wrong nested values
        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            profile: {
              age: 30 // Wrong age
            }
          })
        )

        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            profile: {
              active: false // Wrong active status
            }
          })
        )

        // Test with properties that don't exist
        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            nonExistentProp: 'value'
          })
        )

        testsRunner.expect(testObject).not.toEqual(
          testsRunner.expectMatchObject({
            profile: {
              nonExistentNestedProp: 'value'
            }
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-object values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-object match test', async () => {
        // Arrays should not match object patterns
        testsRunner.expect([1, 2, 3]).not.toEqual(
          testsRunner.expectMatchObject({
            0: 1,
            1: 2,
            2: 3
          })
        )

        // Primitive values should not match object patterns
        testsRunner.expect('string').not.toEqual(
          testsRunner.expectMatchObject({
            length: 6
          })
        )

        testsRunner.expect(123).not.toEqual(
          testsRunner.expectMatchObject({
            value: 123
          })
        )

        testsRunner.expect(true).not.toEqual(
          testsRunner.expectMatchObject({
            valueOf: true
          })
        )

        // null and undefined should not match
        testsRunner.expect(null).not.toEqual(
          testsRunner.expectMatchObject({
            anything: 'value'
          })
        )

        testsRunner.expect(undefined).not.toEqual(
          testsRunner.expectMatchObject({
            anything: 'value'
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated match object test', async () => {
        const testObject = {
          id: 1,
          name: 'Alice',
          status: 'active'
        }

        // Objects that don't match should match not.expectMatchObject()
        testsRunner.expect(testObject).toEqual(
          testsRunner.not.expectMatchObject({
            id: 2 // Wrong ID
          })
        )

        testsRunner.expect(testObject).toEqual(
          testsRunner.not.expectMatchObject({
            name: 'Bob' // Wrong name
          })
        )

        testsRunner.expect(testObject).toEqual(
          testsRunner.not.expectMatchObject({
            nonExistentProp: 'value'
          })
        )

        // Objects that do match should not match not.expectMatchObject()
        testsRunner.expect(testObject).not.toEqual(
          testsRunner.not.expectMatchObject({
            id: 1
          })
        )

        testsRunner.expect(testObject).not.toEqual(
          testsRunner.not.expectMatchObject({
            name: 'Alice',
            status: 'active'
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex nested structures', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex nested match test', async () => {
        const apiResponse = {
          success: true,
          data: {
            users: [
              {
                id: 1,
                name: 'Alice',
                profile: {
                  email: 'alice@example.com',
                  settings: {
                    theme: 'dark',
                    notifications: {
                      email: true,
                      push: false
                    }
                  }
                },
                roles: ['user', 'admin']
              },
              {
                id: 2,
                name: 'Bob',
                profile: {
                  email: 'bob@example.com',
                  settings: {
                    theme: 'light',
                    notifications: {
                      email: false,
                      push: true
                    }
                  }
                },
                roles: ['user']
              }
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

        // Test complex nested matching
        testsRunner.expect(apiResponse).toEqual(
          testsRunner.expectMatchObject({
            success: true,
            data: {
              users: [
                testsRunner.expectMatchObject({
                  id: 1,
                  name: 'Alice',
                  profile: {
                    settings: {
                      theme: 'dark',
                      notifications: {
                        email: true
                      }
                    }
                  }
                }),
                testsRunner.expectMatchObject({
                  id: 2,
                  profile: {
                    settings: {
                      notifications: {
                        push: true
                      }
                    }
                  }
                })
              ],
              pagination: {
                page: 1,
                total: 2
              }
            }
          })
        )

        // Test e-commerce order structure
        const order = {
          orderId: 'ORD-12345',
          customer: {
            id: 'CUST-789',
            name: 'John Doe',
            email: 'john@example.com',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              state: 'NY',
              zipCode: '12345',
              country: 'USA'
            }
          },
          items: [
            {
              productId: 'PROD-001',
              name: 'Laptop',
              price: 999.99,
              quantity: 1,
              category: 'Electronics'
            },
            {
              productId: 'PROD-002',
              name: 'Mouse',
              price: 29.99,
              quantity: 2,
              category: 'Accessories'
            }
          ],
          payment: {
            method: 'credit_card',
            status: 'completed',
            amount: 1059.97,
            currency: 'USD',
            transaction: {
              id: 'TXN-ABC123',
              gateway: 'stripe',
              processedAt: '2023-12-25T10:30:00Z'
            }
          },
          shipping: {
            method: 'standard',
            cost: 0,
            estimatedDelivery: '2023-12-30',
            address: {
              street: '123 Main St',
              city: 'Anytown',
              state: 'NY',
              zipCode: '12345'
            }
          },
          status: 'confirmed',
          createdAt: '2023-12-25T09:00:00Z',
          updatedAt: '2023-12-25T10:30:00Z'
        }

        testsRunner.expect(order).toEqual(
          testsRunner.expectMatchObject({
            orderId: 'ORD-12345',
            customer: {
              name: 'John Doe',
              address: {
                city: 'Anytown',
                state: 'NY'
              }
            },
            items: [
              testsRunner.expectMatchObject({
                productId: 'PROD-001',
                name: 'Laptop',
                category: 'Electronics'
              }),
              testsRunner.expectMatchObject({
                name: 'Mouse',
                quantity: 2
              })
            ],
            payment: {
              status: 'completed',
              transaction: {
                gateway: 'stripe'
              }
            },
            status: 'confirmed'
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Test with empty objects
        testsRunner.expect({}).toEqual(testsRunner.expectMatchObject({}))
        testsRunner.expect({ a: 1 }).toEqual(testsRunner.expectMatchObject({}))
        testsRunner.expect({}).not.toEqual(testsRunner.expectMatchObject({ a: 1 }))

        // Test with nested empty objects
        testsRunner
          .expect({
            nested: {}
          })
          .toEqual(
            testsRunner.expectMatchObject({
              nested: {}
            })
          )

        // Test with arrays containing objects
        const arrayWithObjects = [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2', active: true }
        ]

        testsRunner.expect(arrayWithObjects).toEqual([testsRunner.expectMatchObject({ id: 1 }), testsRunner.expectMatchObject({ id: 2, active: true })])

        // Test with objects containing arrays
        const objectWithArrays = {
          tags: ['tag1', 'tag2'],
          items: [{ name: 'Item 1' }, { name: 'Item 2' }]
        }

        testsRunner.expect(objectWithArrays).toEqual(
          testsRunner.expectMatchObject({
            tags: ['tag1', 'tag2'],
            items: [testsRunner.expectMatchObject({ name: 'Item 1' }), testsRunner.expectMatchObject({ name: 'Item 2' })]
          })
        )

        // Test with circular references
        const circularObj: any = { name: 'circular' }
        circularObj.self = circularObj

        testsRunner.expect(circularObj).toEqual(
          testsRunner.expectMatchObject({
            name: 'circular'
          })
        )

        // Test with special property names
        const specialPropObj = {
          '': 'empty key',
          ' ': 'space key',
          'dot.key': 'dot in key',
          'special-chars!@#': 'special chars',
          '123': 'numeric key'
        }

        testsRunner.expect(specialPropObj).toEqual(
          testsRunner.expectMatchObject({
            '': 'empty key',
            'dot.key': 'dot in key'
          })
        )

        // Test with functions as properties
        const objWithFunctions = {
          name: 'test',
          getValue: () => 'value',
          calculate: function (x: number) {
            return x * 2
          }
        }

        testsRunner.expect(objWithFunctions).toEqual(
          testsRunner.expectMatchObject({
            name: 'test'
          })
        )

        // Functions should match by reference
        const func = () => 'test'
        const objWithSameFunc = { name: 'test', fn: func }
        testsRunner.expect(objWithSameFunc).toEqual(
          testsRunner.expectMatchObject({
            fn: func
          })
        )

        // Test with Date objects
        const dateObj = {
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-12-25')
        }

        testsRunner.expect(dateObj).toEqual(
          testsRunner.expectMatchObject({
            createdAt: new Date('2023-01-01')
          })
        )

        // Test with RegExp objects
        const regexObj = {
          pattern: /test/i,
          validator: /^\d+$/
        }

        testsRunner.expect(regexObj).toEqual(
          testsRunner.expectMatchObject({
            pattern: /test/i
          })
        )

        // Test with mixed types
        const mixedObj = {
          string: 'value',
          number: 42,
          boolean: true,
          null: null,
          undefined: undefined,
          array: [1, 2, 3],
          object: { nested: 'value' },
          date: new Date('2023-01-01'),
          regex: /pattern/
        }

        testsRunner.expect(mixedObj).toEqual(
          testsRunner.expectMatchObject({
            string: 'value',
            number: 42,
            boolean: true,
            null: null,
            undefined: undefined,
            object: { nested: 'value' }
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-object values with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-object values with negation test', async () => {
        // Non-object values should match not.expectMatchObject() (negated true case)
        testsRunner.expect('string').toEqual(testsRunner.not.expectMatchObject({ key: 'value' }))
        testsRunner.expect(42).toEqual(testsRunner.not.expectMatchObject({ key: 'value' }))
        testsRunner.expect(true).toEqual(testsRunner.not.expectMatchObject({ key: 'value' }))
        testsRunner.expect(null).toEqual(testsRunner.not.expectMatchObject({ key: 'value' }))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectMatchObject({ key: 'value' }))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle complex recursive cases in isOnlyAdded', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex recursive isOnlyAdded test', async () => {
        // Test case where we have deeply nested objects with mixed same/added/different values
        // This will exercise the recursive branches in isOnlyAdded method

        const complexActual = {
          level1: {
            level2: {
              level3: {
                expected: 'same-value',
                added: 'extra-value',
                array: [{ expected: 'item1', added: 'extra' }, { expected: 'item2' }, { added: 'only-in-actual' }]
              },
              alsoExpected: 'value',
              onlyInActual: 'added-value'
            },
            anotherExpected: 'test'
          },
          topLevel: 'expected'
        }

        const expectedPartial = {
          level1: {
            level2: {
              level3: {
                expected: 'same-value',
                array: [{ expected: 'item1' }, { expected: 'item2' }]
              },
              alsoExpected: 'value'
            },
            anotherExpected: 'test'
          },
          topLevel: 'expected'
        }

        // This should match because all expected values are present and match,
        // additional values in actual should be allowed
        testsRunner.expect(complexActual).toEqual(testsRunner.expectMatchObject(expectedPartial))

        // Test case with arrays that have extra items but all expected items match
        const arrayWithExtras = {
          items: [
            { id: 1, name: 'first' },
            { id: 2, name: 'second' },
            { id: 3, name: 'third', extra: 'property' }
          ]
        }

        testsRunner.expect(arrayWithExtras).toEqual(
          testsRunner.expectMatchObject({
            items: [
              { id: 1, name: 'first' },
              { id: 2, name: 'second' }
            ]
          })
        )
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
