import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeDefinedTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeDefined assertion test', () => {
    selfTestsRunner.test('Should pass when value is defined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Defined value test', async () => {
        testsRunner.expect(42).toBeDefined()
        testsRunner.expect('hello').toBeDefined()
        testsRunner.expect(null).toBeDefined() // null is defined
        testsRunner.expect(false).toBeDefined()
        testsRunner.expect(0).toBeDefined()
        testsRunner.expect('').toBeDefined()
        testsRunner.expect({}).toBeDefined()
        testsRunner.expect([]).toBeDefined()
        testsRunner.expect(NaN).toBeDefined()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is undefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Undefined value test', async () => {
        testsRunner.expect(undefined).toBeDefined()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be defined, but it was undefined')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.expected).toBe('defined')
      selfTestsRunner.expect(error.actual).toBe(undefined)
    })

    selfTestsRunner.test('Should fail with uninitialized variables', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Uninitialized variable test', async () => {
        let uninitialized: any
        testsRunner.expect(uninitialized).toBeDefined()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be defined, but it was undefined')
      selfTestsRunner.expect(error.actual).toBe(undefined)
    })

    selfTestsRunner.test('Should work with not.toBeDefined for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeDefined test', async () => {
        testsRunner.expect(undefined).not.toBeDefined()

        let uninitialized: any
        testsRunner.expect(uninitialized).not.toBeDefined()

        const obj: any = {}
        testsRunner.expect(obj.nonExistentProperty).not.toBeDefined()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeDefined when value is defined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeDefined test', async () => {
        testsRunner.expect(42).not.toBeDefined()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be undefined, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: '42'
      })
      selfTestsRunner.expect(error.expected).toBe(undefined)
      selfTestsRunner.expect(error.actual).toBe(42)
    })

    selfTestsRunner.test('Should handle different defined types with not.toBeDefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null not.toBeDefined test', async () => {
        testsRunner.expect(null).not.toBeDefined()
      })

      testsRunner.test('String not.toBeDefined test', async () => {
        testsRunner.expect('hello').not.toBeDefined()
      })

      testsRunner.test('Object not.toBeDefined test', async () => {
        testsRunner.expect({}).not.toBeDefined()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Null test
      const nullError = tests[0].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toBe('null')

      // String test
      const stringError = tests[1].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toBe('hello')

      // Object test
      const objectError = tests[2].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toBe('Object')
    })

    selfTestsRunner.test('Should understand that null is defined but undefined is not', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null vs undefined test', async () => {
        testsRunner.expect(null).toBeDefined() // null is defined
        testsRunner.expect(undefined).not.toBeDefined() // undefined is not defined
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
