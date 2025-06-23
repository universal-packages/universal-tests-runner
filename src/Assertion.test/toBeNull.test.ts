import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeNullTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeNull assertion test', () => {
    selfTestsRunner.test('Should pass when value is null', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null value test', async () => {
        testsRunner.expect(null).toBeNull()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not null', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-null value test', async () => {
        testsRunner.expect(42).toBeNull()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be null, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: '42'
      })
      selfTestsRunner.expect(error.expected).toBe(null)
      selfTestsRunner.expect(error.actual).toBe(42)
    })

    selfTestsRunner.test('Should handle different non-null types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toBeNull()
      })

      testsRunner.test('String test', async () => {
        testsRunner.expect('hello').toBeNull()
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toBeNull()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Undefined test
      const undefinedError = tests[0].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toBe('undefined')

      // String test
      const stringError = tests[1].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toBe('hello')

      // Object test
      const objectError = tests[2].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toBe('Object')
    })

    selfTestsRunner.test('Should work with not.toBeNull for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeNull test', async () => {
        testsRunner.expect(42).not.toBeNull()
        testsRunner.expect('hello').not.toBeNull()
        testsRunner.expect(undefined).not.toBeNull()
        testsRunner.expect({}).not.toBeNull()
        testsRunner.expect([]).not.toBeNull()
        testsRunner.expect(false).not.toBeNull()
        testsRunner.expect(0).not.toBeNull()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeNull when value is null', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeNull test', async () => {
        testsRunner.expect(null).not.toBeNull()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value not to be null, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.expected).toBe('not null')
      selfTestsRunner.expect(error.actual).toBe(null)
    })

    selfTestsRunner.test('Should distinguish null from other falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy values test', async () => {
        testsRunner.expect(null).toBeNull()
        testsRunner.expect(undefined).not.toBeNull()
        testsRunner.expect(false).not.toBeNull()
        testsRunner.expect(0).not.toBeNull()
        testsRunner.expect('').not.toBeNull()
        testsRunner.expect(NaN).not.toBeNull()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
