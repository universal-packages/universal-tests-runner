import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function instanceOfAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('InstanceOfAssertion test', () => {
    selfTestsRunner.test('Should match instances of expected constructor', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Basic instanceof test', async () => {
        // Basic built-in types
        testsRunner.expect(new Date()).toEqual(testsRunner.expectInstanceOf(Date))
        testsRunner.expect(new Error('test')).toEqual(testsRunner.expectInstanceOf(Error))
        testsRunner.expect(new RegExp('test')).toEqual(testsRunner.expectInstanceOf(RegExp))
        testsRunner.expect(/test/).toEqual(testsRunner.expectInstanceOf(RegExp))
        testsRunner.expect([]).toEqual(testsRunner.expectInstanceOf(Array))
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectInstanceOf(Array))
        testsRunner.expect({}).toEqual(testsRunner.expectInstanceOf(Object))
        testsRunner.expect(new Map()).toEqual(testsRunner.expectInstanceOf(Map))
        testsRunner.expect(new Set()).toEqual(testsRunner.expectInstanceOf(Set))
        testsRunner.expect(new WeakMap()).toEqual(testsRunner.expectInstanceOf(WeakMap))
        testsRunner.expect(new WeakSet()).toEqual(testsRunner.expectInstanceOf(WeakSet))
        testsRunner.expect(new Promise(() => {})).toEqual(testsRunner.expectInstanceOf(Promise))

        // Functions
        testsRunner.expect(() => {}).toEqual(testsRunner.expectInstanceOf(Function))
        testsRunner.expect(function () {}).toEqual(testsRunner.expectInstanceOf(Function))
        testsRunner.expect(async function () {}).toEqual(testsRunner.expectInstanceOf(Function))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with custom classes', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Custom class instanceof test', async () => {
        class Person {
          constructor(public name: string) {}
        }

        class Employee extends Person {
          constructor(
            name: string,
            public role: string
          ) {
            super(name)
          }
        }

        class Car {
          constructor(public brand: string) {}
        }

        const person = new Person('John')
        const employee = new Employee('Alice', 'Developer')
        const car = new Car('Toyota')

        // Test instanceof with custom classes
        testsRunner.expect(person).toEqual(testsRunner.expectInstanceOf(Person))
        testsRunner.expect(employee).toEqual(testsRunner.expectInstanceOf(Employee))
        testsRunner.expect(employee).toEqual(testsRunner.expectInstanceOf(Person)) // Inheritance
        testsRunner.expect(car).toEqual(testsRunner.expectInstanceOf(Car))

        // Test negative cases
        testsRunner.expect(person).not.toEqual(testsRunner.expectInstanceOf(Employee))
        testsRunner.expect(person).not.toEqual(testsRunner.expectInstanceOf(Car))
        testsRunner.expect(car).not.toEqual(testsRunner.expectInstanceOf(Person))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should not match primitives', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Primitives rejection test', async () => {
        // Primitives should not match instanceof
        testsRunner.expect('string').not.toEqual(testsRunner.expectInstanceOf(String))
        testsRunner.expect(123).not.toEqual(testsRunner.expectInstanceOf(Number))
        testsRunner.expect(true).not.toEqual(testsRunner.expectInstanceOf(Boolean))
        testsRunner.expect(false).not.toEqual(testsRunner.expectInstanceOf(Boolean))
        testsRunner.expect(null).not.toEqual(testsRunner.expectInstanceOf(Object))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectInstanceOf(Object))
        testsRunner.expect(Symbol('test')).not.toEqual(testsRunner.expectInstanceOf(Symbol))

        // But their boxed equivalents should match
        testsRunner.expect(new String('test')).toEqual(testsRunner.expectInstanceOf(String))
        testsRunner.expect(new Number(123)).toEqual(testsRunner.expectInstanceOf(Number))
        testsRunner.expect(new Boolean(true)).toEqual(testsRunner.expectInstanceOf(Boolean))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negated instanceof test', async () => {
        // Primitives should match not.expectInstanceOf()
        testsRunner.expect('string').toEqual(testsRunner.not.expectInstanceOf(String))
        testsRunner.expect(123).toEqual(testsRunner.not.expectInstanceOf(Number))
        testsRunner.expect(true).toEqual(testsRunner.not.expectInstanceOf(Boolean))
        testsRunner.expect(null).toEqual(testsRunner.not.expectInstanceOf(Object))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectInstanceOf(Array))

        // Wrong types should match not.expectInstanceOf()
        testsRunner.expect(new Date()).toEqual(testsRunner.not.expectInstanceOf(Array))
        testsRunner.expect([]).toEqual(testsRunner.not.expectInstanceOf(Date))
        testsRunner.expect({}).toEqual(testsRunner.not.expectInstanceOf(Array))

        // Correct types should not match not.expectInstanceOf()
        testsRunner.expect(new Date()).not.toEqual(testsRunner.not.expectInstanceOf(Date))
        testsRunner.expect([]).not.toEqual(testsRunner.not.expectInstanceOf(Array))
        testsRunner.expect({}).not.toEqual(testsRunner.not.expectInstanceOf(Object))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex object with expectInstanceOf', async () => {
        class User {
          constructor(public name: string) {}
        }

        class Logger {
          log(message: string) {
            console.log(message)
          }
        }

        const apiResponse = {
          timestamp: new Date(),
          user: new User('John'),
          errors: [new Error('Network error'), new Error('Timeout')],
          logger: new Logger(),
          config: {
            pattern: /test-\d+/,
            cache: new Map(),
            settings: new Set(['debug', 'verbose'])
          },
          callbacks: [
            () => console.log('callback1'),
            function () {
              console.log('callback2')
            }
          ]
        }

        testsRunner.expect(apiResponse).toMatchObject({
          timestamp: testsRunner.expectInstanceOf(Date),
          user: testsRunner.expectInstanceOf(User),
          errors: [testsRunner.expectInstanceOf(Error), testsRunner.expectInstanceOf(Error)],
          logger: testsRunner.expectInstanceOf(Logger),
          config: {
            pattern: testsRunner.expectInstanceOf(RegExp),
            cache: testsRunner.expectInstanceOf(Map),
            settings: testsRunner.expectInstanceOf(Set)
          },
          callbacks: [testsRunner.expectInstanceOf(Function), testsRunner.expectInstanceOf(Function)]
        })

        // Test mixed types where some should not be instances
        const mixedData = {
          name: 'test', // string primitive
          count: 42, // number primitive
          active: true, // boolean primitive
          created: new Date(), // Date instance
          tags: ['tag1', 'tag2'] // Array instance
        }

        testsRunner.expect(mixedData).toMatchObject({
          name: testsRunner.not.expectInstanceOf(String), // primitive string
          count: testsRunner.not.expectInstanceOf(Number), // primitive number
          active: testsRunner.not.expectInstanceOf(Boolean), // primitive boolean
          created: testsRunner.expectInstanceOf(Date), // Date instance
          tags: testsRunner.expectInstanceOf(Array) // Array instance
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle inheritance correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Inheritance test', async () => {
        class Animal {
          constructor(public name: string) {}
        }

        class Dog extends Animal {
          constructor(
            name: string,
            public breed: string
          ) {
            super(name)
          }
        }

        class Cat extends Animal {
          constructor(
            name: string,
            public color: string
          ) {
            super(name)
          }
        }

        const dog = new Dog('Buddy', 'Golden Retriever')
        const cat = new Cat('Whiskers', 'Orange')

        // Test inheritance chain
        testsRunner.expect(dog).toEqual(testsRunner.expectInstanceOf(Dog))
        testsRunner.expect(dog).toEqual(testsRunner.expectInstanceOf(Animal))
        testsRunner.expect(dog).toEqual(testsRunner.expectInstanceOf(Object))

        testsRunner.expect(cat).toEqual(testsRunner.expectInstanceOf(Cat))
        testsRunner.expect(cat).toEqual(testsRunner.expectInstanceOf(Animal))
        testsRunner.expect(cat).toEqual(testsRunner.expectInstanceOf(Object))

        // Test sibling classes don't match
        testsRunner.expect(dog).not.toEqual(testsRunner.expectInstanceOf(Cat))
        testsRunner.expect(cat).not.toEqual(testsRunner.expectInstanceOf(Dog))

        // Test with built-in inheritance
        testsRunner.expect(new TypeError('test')).toEqual(testsRunner.expectInstanceOf(TypeError))
        testsRunner.expect(new TypeError('test')).toEqual(testsRunner.expectInstanceOf(Error))
        testsRunner.expect(new TypeError('test')).toEqual(testsRunner.expectInstanceOf(Object))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Edge cases test', async () => {
        // Arrays are instances of Object
        testsRunner.expect([]).toEqual(testsRunner.expectInstanceOf(Object))
        testsRunner.expect([1, 2, 3]).toEqual(testsRunner.expectInstanceOf(Object))

        // Functions are instances of Object
        testsRunner.expect(() => {}).toEqual(testsRunner.expectInstanceOf(Object))

        // Dates are instances of Object
        testsRunner.expect(new Date()).toEqual(testsRunner.expectInstanceOf(Object))

        // RegExp literals vs constructor
        testsRunner.expect(/test/).toEqual(testsRunner.expectInstanceOf(RegExp))
        testsRunner.expect(new RegExp('test')).toEqual(testsRunner.expectInstanceOf(RegExp))

        // Error types
        testsRunner.expect(new RangeError('test')).toEqual(testsRunner.expectInstanceOf(RangeError))
        testsRunner.expect(new RangeError('test')).toEqual(testsRunner.expectInstanceOf(Error))
        testsRunner.expect(new ReferenceError('test')).toEqual(testsRunner.expectInstanceOf(ReferenceError))
        testsRunner.expect(new ReferenceError('test')).toEqual(testsRunner.expectInstanceOf(Error))

        // Collections
        testsRunner.expect(new Int8Array()).toEqual(testsRunner.expectInstanceOf(Int8Array))
        testsRunner.expect(new Int8Array()).toEqual(testsRunner.expectInstanceOf(Object))
        testsRunner.expect(new Uint8Array()).toEqual(testsRunner.expectInstanceOf(Uint8Array))
        testsRunner.expect(new Float32Array()).toEqual(testsRunner.expectInstanceOf(Float32Array))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
