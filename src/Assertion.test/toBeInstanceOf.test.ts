import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeInstanceOfTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeInstanceOf assertion test', () => {
    selfTestsRunner.test('Should pass when value is instance of expected class', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Instance of test', async () => {
        testsRunner.expect(new Date()).toBeInstanceOf(Date)
        testsRunner.expect(new Array()).toBeInstanceOf(Array)
        testsRunner.expect(new RegExp('test')).toBeInstanceOf(RegExp)
        testsRunner.expect(new Error('test')).toBeInstanceOf(Error)
        testsRunner.expect(new Map()).toBeInstanceOf(Map)
        testsRunner.expect(new Set()).toBeInstanceOf(Set)
        testsRunner.expect(new Promise(() => {})).toBeInstanceOf(Promise)

        // Array literals
        testsRunner.expect([]).toBeInstanceOf(Array)
        testsRunner.expect({}).toBeInstanceOf(Object)

        // Functions
        testsRunner.expect(() => {}).toBeInstanceOf(Function)
        testsRunner.expect(function () {}).toBeInstanceOf(Function)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with custom classes', async () => {
      const testsRunner = new TestsRunner()

      class CustomClass {
        name: string
        constructor(name: string) {
          this.name = name
        }
      }

      class ExtendedClass extends CustomClass {
        age: number
        constructor(name: string, age: number) {
          super(name)
          this.age = age
        }
      }

      testsRunner.test('Custom class test', async () => {
        const custom = new CustomClass('test')
        const extended = new ExtendedClass('test', 25)

        testsRunner.expect(custom).toBeInstanceOf(CustomClass)
        testsRunner.expect(extended).toBeInstanceOf(ExtendedClass)
        testsRunner.expect(extended).toBeInstanceOf(CustomClass) // Inheritance
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not instance of expected class', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not instance of test', async () => {
        testsRunner.expect('hello').toBeInstanceOf(Date)
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be instance of {{expected}}, but it was not')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Date',
        actual: 'hello'
      })
      selfTestsRunner.expect(error.expected).toBe('Date')
      selfTestsRunner.expect(error.actual).toBe('hello')
    })

    selfTestsRunner.test('Should handle different non-instance types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Number test', async () => {
        testsRunner.expect(42).toBeInstanceOf(String)
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toBeInstanceOf(Object)
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toBeInstanceOf(Object)
      })

      testsRunner.test('Primitive vs wrapper test', async () => {
        testsRunner.expect('hello').toBeInstanceOf(String) // Primitive string vs String object
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Number test
      const numberError = tests[0].failureReason as TestError
      selfTestsRunner.expect(numberError.messageLocals.actual).toBe('42')
      selfTestsRunner.expect(numberError.messageLocals.expected).toBe('String')

      // Null test
      const nullError = tests[1].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toBe('null')

      // Undefined test
      const undefinedError = tests[2].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toBe('undefined')

      // Primitive vs wrapper test
      const primitiveError = tests[3].failureReason as TestError
      selfTestsRunner.expect(primitiveError.messageLocals.actual).toBe('hello')
    })

    selfTestsRunner.test('Should work with not.toBeInstanceOf for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeInstanceOf test', async () => {
        testsRunner.expect('hello').not.toBeInstanceOf(Date)
        testsRunner.expect(42).not.toBeInstanceOf(String)
        testsRunner.expect(null).not.toBeInstanceOf(Object)
        testsRunner.expect(undefined).not.toBeInstanceOf(Object)
        testsRunner.expect([]).not.toBeInstanceOf(Date)
        testsRunner.expect({}).not.toBeInstanceOf(Array)

        // Primitive vs wrapper
        testsRunner.expect('hello').not.toBeInstanceOf(String)
        testsRunner.expect(42).not.toBeInstanceOf(Number)
        testsRunner.expect(true).not.toBeInstanceOf(Boolean)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeInstanceOf when value is instance', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeInstanceOf test', async () => {
        testsRunner.expect(new Date()).not.toBeInstanceOf(Date)
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be instance of {{expected}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Date',
        actual: 'Object'
      })
      selfTestsRunner.expect(error.expected).toBe('Date')
      selfTestsRunner.expect(error.actual).toBeInstanceOf(Date)
    })

    selfTestsRunner.test('Should handle inheritance correctly', async () => {
      const testsRunner = new TestsRunner()

      class Animal {
        name: string
        constructor(name: string) {
          this.name = name
        }
      }

      class Dog extends Animal {
        breed: string
        constructor(name: string, breed: string) {
          super(name)
          this.breed = breed
        }
      }

      class Cat extends Animal {
        color: string
        constructor(name: string, color: string) {
          super(name)
          this.color = color
        }
      }

      testsRunner.test('Inheritance test', async () => {
        const dog = new Dog('Buddy', 'Golden Retriever')
        const cat = new Cat('Whiskers', 'Orange')

        // Dog is instance of both Dog and Animal
        testsRunner.expect(dog).toBeInstanceOf(Dog)
        testsRunner.expect(dog).toBeInstanceOf(Animal)
        testsRunner.expect(dog).toBeInstanceOf(Object)

        // Cat is instance of Cat and Animal, but not Dog
        testsRunner.expect(cat).toBeInstanceOf(Cat)
        testsRunner.expect(cat).toBeInstanceOf(Animal)
        testsRunner.expect(cat).not.toBeInstanceOf(Dog)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle built-in error types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Error types test', async () => {
        testsRunner.expect(new Error()).toBeInstanceOf(Error)
        testsRunner.expect(new TypeError()).toBeInstanceOf(TypeError)
        testsRunner.expect(new TypeError()).toBeInstanceOf(Error) // Inheritance
        testsRunner.expect(new ReferenceError()).toBeInstanceOf(ReferenceError)
        testsRunner.expect(new ReferenceError()).toBeInstanceOf(Error) // Inheritance
        testsRunner.expect(new SyntaxError()).toBeInstanceOf(SyntaxError)
        testsRunner.expect(new SyntaxError()).toBeInstanceOf(Error) // Inheritance

        // Cross-type checks should fail
        testsRunner.expect(new TypeError()).not.toBeInstanceOf(ReferenceError)
        testsRunner.expect(new ReferenceError()).not.toBeInstanceOf(SyntaxError)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle wrapper objects vs primitives', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Wrapper vs primitive test', async () => {
        // Wrapper objects are instances
        testsRunner.expect(new String('hello')).toBeInstanceOf(String)
        testsRunner.expect(new Number(42)).toBeInstanceOf(Number)
        testsRunner.expect(new Boolean(true)).toBeInstanceOf(Boolean)

        // Primitives are not instances
        testsRunner.expect('hello').not.toBeInstanceOf(String)
        testsRunner.expect(42).not.toBeInstanceOf(Number)
        testsRunner.expect(true).not.toBeInstanceOf(Boolean)

        // All wrapper objects are also instances of Object
        testsRunner.expect(new String('hello')).toBeInstanceOf(Object)
        testsRunner.expect(new Number(42)).toBeInstanceOf(Object)
        testsRunner.expect(new Boolean(true)).toBeInstanceOf(Object)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
