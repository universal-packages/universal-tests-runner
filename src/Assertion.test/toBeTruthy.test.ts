import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeTruthyTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeTruthy assertion test', () => {
    selfTestsRunner.test('Should pass when value is truthy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Truthy value test', async () => {
        testsRunner.expect(true).toBeTruthy()
        testsRunner.expect(1).toBeTruthy()
        testsRunner.expect(-1).toBeTruthy()
        testsRunner.expect('hello').toBeTruthy()
        testsRunner.expect('0').toBeTruthy() // string '0' is truthy
        testsRunner.expect(' ').toBeTruthy() // space is truthy
        testsRunner.expect({}).toBeTruthy()
        testsRunner.expect([]).toBeTruthy()
        testsRunner.expect(() => {}).toBeTruthy()
        testsRunner.expect(Infinity).toBeTruthy()
        testsRunner.expect(-Infinity).toBeTruthy()
        testsRunner.expect(new Date()).toBeTruthy()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is falsy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy value test', async () => {
        testsRunner.expect(false).toBeTruthy()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be truthy')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'boolean',
          representation: 'false'
        }
      })
    })

    selfTestsRunner.test('Should handle all falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('False test', async () => {
        testsRunner.expect(false).toBeTruthy()
      })

      testsRunner.test('Zero test', async () => {
        testsRunner.expect(0).toBeTruthy()
      })

      testsRunner.test('Empty string test', async () => {
        testsRunner.expect('').toBeTruthy()
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toBeTruthy()
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toBeTruthy()
      })

      testsRunner.test('NaN test', async () => {
        testsRunner.expect(NaN).toBeTruthy()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // All should fail
      tests.forEach((test) => {
        selfTestsRunner.expect(test.status).toBe('failed')
      })

      // Check specific error messages
      // false test
      const falseError = tests[0].failureReason as TestError
      selfTestsRunner.expect(falseError.messageLocals.actual).toEqual({
        type: 'boolean',
        representation: 'false'
      })

      // 0 test
      const zeroError = tests[1].failureReason as TestError
      selfTestsRunner.expect(zeroError.messageLocals.actual).toEqual({
        type: 'number',
        representation: '0'
      })

      // empty string test
      const emptyError = tests[2].failureReason as TestError
      selfTestsRunner.expect(emptyError.messageLocals.actual).toEqual({
        type: 'string',
        representation: "''"
      })

      // null test
      const nullError = tests[3].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toEqual({
        type: 'null',
        representation: 'null'
      })

      // undefined test
      const undefinedError = tests[4].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toEqual({
        type: 'undefined',
        representation: 'undefined'
      })

      // NaN test
      const nanError = tests[5].failureReason as TestError
      selfTestsRunner.expect(nanError.messageLocals.actual).toEqual({
        type: 'number',
        representation: 'NaN'
      })
    })

    selfTestsRunner.test('Should work with not.toBeTruthy for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeTruthy test', async () => {
        testsRunner.expect(false).not.toBeTruthy()
        testsRunner.expect(0).not.toBeTruthy()
        testsRunner.expect('').not.toBeTruthy()
        testsRunner.expect(null).not.toBeTruthy()
        testsRunner.expect(undefined).not.toBeTruthy()
        testsRunner.expect(NaN).not.toBeTruthy()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeTruthy when value is truthy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeTruthy test', async () => {
        testsRunner.expect(42).not.toBeTruthy()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to not be truthy, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'number',
          representation: '42'
        }
      })
    })

    selfTestsRunner.test('Should handle different truthy types with not.toBeTruthy', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String not.toBeTruthy test', async () => {
        testsRunner.expect('hello').not.toBeTruthy()
      })

      testsRunner.test('Object not.toBeTruthy test', async () => {
        testsRunner.expect({}).not.toBeTruthy()
      })

      testsRunner.test('Array not.toBeTruthy test', async () => {
        testsRunner.expect([]).not.toBeTruthy()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // String test
      const stringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toEqual({
        type: 'string',
        representation: "'hello'"
      })

      // Object test
      const objectError = tests[1].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toEqual({
        type: 'instanceOf',
        representation: 'Object'
      })

      // Array test
      const arrayError = tests[2].failureReason as TestError
      selfTestsRunner.expect(arrayError.messageLocals.actual).toEqual({
        type: 'array',
        representation: '[Array]'
      })
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
