import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeUndefinedTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeUndefined assertion test', () => {
    selfTestsRunner.test('Should pass when value is undefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Undefined value test', async () => {
        testsRunner.expect(undefined).toBeUndefined()

        let uninitialized: any
        testsRunner.expect(uninitialized).toBeUndefined()

        const obj: any = {}
        testsRunner.expect(obj.nonExistentProperty).toBeUndefined()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not undefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-undefined value test', async () => {
        testsRunner.expect(42).toBeUndefined()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'number',
          representation: '42'
        },
        target: {
          type: 'undefined',
          representation: 'undefined'
        }
      })
    })

    selfTestsRunner.test('Should handle different non-undefined types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toBeUndefined()
      })

      testsRunner.test('String test', async () => {
        testsRunner.expect('hello').toBeUndefined()
      })

      testsRunner.test('Boolean test', async () => {
        testsRunner.expect(false).toBeUndefined()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Null test
      const nullError = tests[0].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toEqual({
        type: 'null',
        representation: 'null'
      })

      // String test
      const stringError = tests[1].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toEqual({
        type: 'string',
        representation: "'hello'"
      })

      // Boolean test
      const boolError = tests[2].failureReason as TestError
      selfTestsRunner.expect(boolError.messageLocals.actual).toEqual({
        type: 'boolean',
        representation: 'false'
      })
    })

    selfTestsRunner.test('Should work with not.toBeUndefined for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeUndefined test', async () => {
        testsRunner.expect(42).not.toBeUndefined()
        testsRunner.expect('hello').not.toBeUndefined()
        testsRunner.expect(null).not.toBeUndefined()
        testsRunner.expect({}).not.toBeUndefined()
        testsRunner.expect([]).not.toBeUndefined()
        testsRunner.expect(false).not.toBeUndefined()
        testsRunner.expect(0).not.toBeUndefined()
        testsRunner.expect('').not.toBeUndefined()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeUndefined when value is undefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeUndefined test', async () => {
        testsRunner.expect(undefined).not.toBeUndefined()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to be {{target}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'undefined',
          representation: 'undefined'
        },
        target: {
          type: 'undefined',
          representation: 'undefined'
        }
      })
    })

    selfTestsRunner.test('Should distinguish undefined from other falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Falsy values test', async () => {
        testsRunner.expect(undefined).toBeUndefined()
        testsRunner.expect(null).not.toBeUndefined()
        testsRunner.expect(false).not.toBeUndefined()
        testsRunner.expect(0).not.toBeUndefined()
        testsRunner.expect('').not.toBeUndefined()
        testsRunner.expect(NaN).not.toBeUndefined()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
