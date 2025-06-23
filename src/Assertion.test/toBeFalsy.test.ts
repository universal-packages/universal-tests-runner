import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeFalsyTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeFalsy assertion test', () => {
    selfTestsRunner.test('Should pass when value is falsy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy value test', async () => {
        testsRunner.expect(false).toBeFalsy()
        testsRunner.expect(0).toBeFalsy()
        testsRunner.expect(-0).toBeFalsy()
        testsRunner.expect('').toBeFalsy()
        testsRunner.expect(null).toBeFalsy()
        testsRunner.expect(undefined).toBeFalsy()
        testsRunner.expect(NaN).toBeFalsy()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is truthy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Truthy value test', async () => {
        testsRunner.expect(42).toBeFalsy()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be falsy, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: '42'
      })
      selfTestsRunner.expect(error.expected).toBe('falsy')
      selfTestsRunner.expect(error.actual).toBe(42)
    })

    selfTestsRunner.test('Should handle all truthy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('True test', async () => {
        testsRunner.expect(true).toBeFalsy()
      })

      testsRunner.test('Number test', async () => {
        testsRunner.expect(1).toBeFalsy()
      })

      testsRunner.test('String test', async () => {
        testsRunner.expect('hello').toBeFalsy()
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toBeFalsy()
      })

      testsRunner.test('Array test', async () => {
        testsRunner.expect([]).toBeFalsy()
      })

      testsRunner.test('Function test', async () => {
        testsRunner.expect(() => {}).toBeFalsy()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail
      tests.forEach((test) => {
        selfTestsRunner.expect(test.status).toBe('failed')
      })

      // Check specific error messages
      const trueError = tests[0].failureReason as TestError
      selfTestsRunner.expect(trueError.messageLocals.actual).toBe('true')

      const numberError = tests[1].failureReason as TestError
      selfTestsRunner.expect(numberError.messageLocals.actual).toBe('1')

      const stringError = tests[2].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toBe('hello')

      const objectError = tests[3].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toBe('Object')

      const arrayError = tests[4].failureReason as TestError
      selfTestsRunner.expect(arrayError.messageLocals.actual).toBe('Array')
    })

    selfTestsRunner.test('Should work with not.toBeFalsy for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeFalsy test', async () => {
        testsRunner.expect(true).not.toBeFalsy()
        testsRunner.expect(1).not.toBeFalsy()
        testsRunner.expect(-1).not.toBeFalsy()
        testsRunner.expect('hello').not.toBeFalsy()
        testsRunner.expect('0').not.toBeFalsy() // string '0' is truthy
        testsRunner.expect(' ').not.toBeFalsy() // space is truthy
        testsRunner.expect({}).not.toBeFalsy()
        testsRunner.expect([]).not.toBeFalsy()
        testsRunner.expect(() => {}).not.toBeFalsy()
        testsRunner.expect(Infinity).not.toBeFalsy()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeFalsy when value is falsy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeFalsy test', async () => {
        testsRunner.expect(false).not.toBeFalsy()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be truthy, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: 'false'
      })
      selfTestsRunner.expect(error.expected).toBe('truthy')
      selfTestsRunner.expect(error.actual).toBe(false)
    })

    selfTestsRunner.test('Should handle different falsy types with not.toBeFalsy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Zero not.toBeFalsy test', async () => {
        testsRunner.expect(0).not.toBeFalsy()
      })

      testsRunner.test('Empty string not.toBeFalsy test', async () => {
        testsRunner.expect('').not.toBeFalsy()
      })

      testsRunner.test('Null not.toBeFalsy test', async () => {
        testsRunner.expect(null).not.toBeFalsy()
      })

      testsRunner.test('Undefined not.toBeFalsy test', async () => {
        testsRunner.expect(undefined).not.toBeFalsy()
      })

      testsRunner.test('NaN not.toBeFalsy test', async () => {
        testsRunner.expect(NaN).not.toBeFalsy()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Zero test
      const zeroError = tests[0].failureReason as TestError
      selfTestsRunner.expect(zeroError.messageLocals.actual).toBe('0')

      // Empty string test
      const emptyStringError = tests[1].failureReason as TestError
      selfTestsRunner.expect(emptyStringError.messageLocals.actual).toBe('')

      // Null test
      const nullError = tests[2].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toBe('null')

      // Undefined test
      const undefinedError = tests[3].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toBe('undefined')

      // NaN test
      const nanError = tests[4].failureReason as TestError
      selfTestsRunner.expect(nanError.messageLocals.actual).toBe('NaN')
    })

    selfTestsRunner.test('Should distinguish between different zero values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Zero values test', async () => {
        testsRunner.expect(0).toBeFalsy()
        testsRunner.expect(-0).toBeFalsy()
        testsRunner.expect(+0).toBeFalsy()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
