import { TestsRunner } from '../src'

export async function runMatchersExample(): Promise<void> {
  console.log('🚀 Running Matchers Example')
  console.log('='.repeat(50))

  // Example 1: Basic matchers
  console.log('\n1️⃣  Basic Matchers:')
  const testsRunner1 = new TestsRunner({ identifier: 'matchers-example-1' })
  await runBasicMatchersExample(testsRunner1)

  // Example 2: Object and array matchers
  console.log('\n2️⃣  Object and Array Matchers:')
  const testsRunner2 = new TestsRunner({ identifier: 'matchers-example-2' })
  await runObjectArrayMatchersExample(testsRunner2)

  // Example 3: Promise and function matchers
  console.log('\n3️⃣  Promise and Function Matchers:')
  const testsRunner3 = new TestsRunner({ identifier: 'matchers-example-3' })
  await runPromiseFunctionMatchersExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicMatchersExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Basic Matchers', () => {
    testsRunner.describe('toBe and toEqual', () => {
      testsRunner.test('toBe - strict equality for primitives', () => {
        testsRunner.expect(5).toBe(5)
        testsRunner.expect('hello').toBe('hello')
        testsRunner.expect(true).toBe(true)
        testsRunner.expect(null).toBe(null)
        testsRunner.expect(undefined).toBe(undefined)
      })

      testsRunner.test('toEqual - deep equality for objects/arrays', () => {
        testsRunner.expect({ name: 'John', age: 30 }).toEqual({ name: 'John', age: 30 })
        testsRunner.expect([1, 2, 3]).toEqual([1, 2, 3])
        testsRunner.expect({ items: [1, 2, { nested: true }] }).toEqual({ items: [1, 2, { nested: true }] })
      })
    })

    testsRunner.describe('Truthiness matchers', () => {
      testsRunner.test('toBeTruthy and toBeFalsy', () => {
        testsRunner.expect(true).toBeTruthy()
        testsRunner.expect(1).toBeTruthy()
        testsRunner.expect('hello').toBeTruthy()
        testsRunner.expect({}).toBeTruthy()
        testsRunner.expect([]).toBeTruthy()

        testsRunner.expect(false).toBeFalsy()
        testsRunner.expect(0).toBeFalsy()
        testsRunner.expect('').toBeFalsy()
        testsRunner.expect(null).toBeFalsy()
        testsRunner.expect(undefined).toBeFalsy()
      })

      testsRunner.test('toBeDefined and toBeUndefined', () => {
        testsRunner.expect('defined').toBeDefined()
        testsRunner.expect(0).toBeDefined()
        testsRunner.expect(false).toBeDefined()
        testsRunner.expect(null).toBeDefined()

        testsRunner.expect(undefined).toBeUndefined()
        let uninitialized: any
        testsRunner.expect(uninitialized).toBeUndefined()
      })

      testsRunner.test('toBeNull', () => {
        testsRunner.expect(null).toBeNull()
        testsRunner.expect(undefined).not.toBeNull()
        testsRunner.expect(0).not.toBeNull()
        testsRunner.expect('').not.toBeNull()
      })
    })

    testsRunner.describe('Numeric matchers', () => {
      testsRunner.test('toBeGreaterThan and toBeLessThan', () => {
        testsRunner.expect(10).toBeGreaterThan(5)
        testsRunner.expect(5).toBeLessThan(10)
        testsRunner.expect(-5).toBeGreaterThan(-10)
        testsRunner.expect(-10).toBeLessThan(-5)
      })

      testsRunner.test('toBeGreaterThanOrEqual and toBeLessThanOrEqual', () => {
        testsRunner.expect(10).toBeGreaterThanOrEqual(10)
        testsRunner.expect(10).toBeGreaterThanOrEqual(5)
        testsRunner.expect(5).toBeLessThanOrEqual(5)
        testsRunner.expect(5).toBeLessThanOrEqual(10)
      })

      testsRunner.test('toBeCloseTo for floating point numbers', () => {
        testsRunner.expect(0.1 + 0.2).toBeCloseTo(0.3)
        testsRunner.expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
        testsRunner.expect(Math.PI).toBeCloseTo(3.14, 2)
        testsRunner.expect(Math.PI).toBeCloseTo(3.14159, 5)
      })

      testsRunner.test('toBeNaN', () => {
        testsRunner.expect(NaN).toBeNaN()
        testsRunner.expect(Number('invalid')).toBeNaN()
        testsRunner.expect(0 / 0).toBeNaN()
        testsRunner.expect(5).not.toBeNaN()
      })
    })

    testsRunner.describe('String and pattern matchers', () => {
      testsRunner.test('toMatch with regex', () => {
        testsRunner.expect('hello world').toMatch(/world/)
        testsRunner.expect('123-456-7890').toMatch(/^\d{3}-\d{3}-\d{4}$/)
        testsRunner.expect('test@example.com').toMatch(/@/)
        testsRunner.expect('Hello World').toMatch(/^Hello/)
      })

      testsRunner.test('toContain for strings and arrays', () => {
        testsRunner.expect('hello world').toContain('world')
        testsRunner.expect('hello world').toContain('hello')
        testsRunner.expect(['apple', 'banana', 'cherry']).toContain('banana')
        testsRunner.expect([1, 2, 3, 4, 5]).toContain(3)
      })
    })

    testsRunner.describe('Type matchers', () => {
      testsRunner.test('toBeInstanceOf', () => {
        testsRunner.expect(new Date()).toBeInstanceOf(Date)
        testsRunner.expect([]).toBeInstanceOf(Array)
        testsRunner.expect(new Error('test')).toBeInstanceOf(Error)
        testsRunner.expect(/regex/).toBeInstanceOf(RegExp)
        testsRunner.expect(new Map()).toBeInstanceOf(Map)
        testsRunner.expect(new Set()).toBeInstanceOf(Set)
      })
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Basic matchers tests completed. Status: ${testsRunner.status}`)
}

async function runObjectArrayMatchersExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Object and Array Matchers', () => {
    testsRunner.test('toHaveLength', () => {
      testsRunner.expect([1, 2, 3]).toHaveLength(3)
      testsRunner.expect('hello').toHaveLength(5)
      testsRunner.expect([]).toHaveLength(0)
      testsRunner.expect('').toHaveLength(0)
    })

    testsRunner.test('toHaveProperty', () => {
      const obj = {
        name: 'John',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      }

      testsRunner.expect(obj).toHaveProperty('name')
      testsRunner.expect(obj).toHaveProperty('name', 'John')
      testsRunner.expect(obj).toHaveProperty('age', 30)
      testsRunner.expect(obj).toHaveProperty('address.street', '123 Main St')
      testsRunner.expect(obj).toHaveProperty('address.city')
    })

    testsRunner.test('toMatchObject', () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        settings: {
          theme: 'dark',
          notifications: true
        }
      }

      testsRunner.expect(user).toMatchObject({
        name: 'John Doe',
        settings: { theme: 'dark' }
      })

      testsRunner.expect(user).toMatchObject({
        id: 1,
        email: 'john@example.com'
      })
    })

    testsRunner.test('toContainEqual for deep equality in arrays', () => {
      const users = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' }
      ]

      testsRunner.expect(users).toContainEqual({ id: 2, name: 'Jane' })
      testsRunner.expect(users).toContainEqual({ id: 1, name: 'John' })

      const nestedArray = [
        [1, 2],
        [3, 4],
        [5, 6]
      ]
      testsRunner.expect(nestedArray).toContainEqual([3, 4])
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Object/Array matchers tests completed. Status: ${testsRunner.status}`)
}

async function runPromiseFunctionMatchersExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Promise and Function Matchers', () => {
    testsRunner.test('toThrow for synchronous functions', () => {
      const throwingFunction = () => {
        throw new Error('Something went wrong')
      }

      const specificError = () => {
        throw new Error('Specific error message')
      }

      testsRunner.expect(throwingFunction).toThrow()
      testsRunner.expect(throwingFunction).toThrow('Something went wrong')
      testsRunner.expect(throwingFunction).toThrow(/went wrong/)
      testsRunner.expect(specificError).toThrow(new Error('Specific error message'))

      // Function that doesn't throw
      const safeFunction = () => 'safe'
      testsRunner.expect(safeFunction).not.toThrow()
    })

    testsRunner.test('toResolve for promises', async () => {
      const resolvingPromise = Promise.resolve('success')
      const resolvingWithValue = Promise.resolve({ status: 'ok', data: 'test' })

      await testsRunner.expect(resolvingPromise).toResolve()
      await testsRunner.expect(resolvingPromise).toResolve('success')
      await testsRunner.expect(resolvingWithValue).toResolve({ status: 'ok', data: 'test' })
    })

    testsRunner.test('toReject for promises', async () => {
      const rejectingPromise = Promise.reject(new Error('Failed'))
      const rejectingWithMessage = Promise.reject(new Error('Specific failure'))
      const rejectingWithString = Promise.reject('String error')

      await testsRunner.expect(rejectingPromise).toReject()
      await testsRunner.expect(rejectingWithMessage).toReject('Specific failure')
      await testsRunner.expect(rejectingWithMessage).toReject(/failure/)
      await testsRunner.expect(rejectingWithString).toReject('String error')
    })

    testsRunner.test('async function examples', async () => {
      const asyncSuccess = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return 'async result'
      }

      const asyncFailure = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Async error')
      }

      // Test async function results
      const result = await asyncSuccess()
      testsRunner.expect(result).toEqual('async result')

      // Test async function rejection
      await testsRunner.expect(asyncFailure()).toReject('Async error')
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Promise/Function matchers tests completed. Status: ${testsRunner.status}`)
}
