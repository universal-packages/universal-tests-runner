import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toBeNaNTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toBeNaN assertion test', () => {
    selfTestsRunner.test('Should pass when value is NaN', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('NaN value test', async () => {
        testsRunner.expect(NaN).toBeNaN()
        testsRunner.expect(Number.NaN).toBeNaN()
        testsRunner.expect(0 / 0).toBeNaN()
        testsRunner.expect(parseInt('not a number')).toBeNaN()
        testsRunner.expect(parseFloat('not a number')).toBeNaN()
        testsRunner.expect(Math.sqrt(-1)).toBeNaN()
        testsRunner.expect(Number('not a number')).toBeNaN()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not NaN', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-NaN value test', async () => {
        testsRunner.expect(42).toBeNaN()
      })

      await testsRunner.run()

      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value to be NaN, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: '42'
      })
      // Note: Can't use .toBe(NaN) because NaN !== NaN
      selfTestsRunner.expect(Number.isNaN(error.expected)).toBe(true)
      selfTestsRunner.expect(error.actual).toBe(42)
    })

    selfTestsRunner.test('Should handle different non-NaN number types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Zero test', async () => {
        testsRunner.expect(0).toBeNaN()
      })

      testsRunner.test('Infinity test', async () => {
        testsRunner.expect(Infinity).toBeNaN()
      })

      testsRunner.test('Negative infinity test', async () => {
        testsRunner.expect(-Infinity).toBeNaN()
      })

      testsRunner.test('Float test', async () => {
        testsRunner.expect(3.14).toBeNaN()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // Zero test
      const zeroError = tests[0].failureReason as TestError
      selfTestsRunner.expect(zeroError.messageLocals.actual).toBe('0')

      // Infinity test
      const infinityError = tests[1].failureReason as TestError
      selfTestsRunner.expect(infinityError.messageLocals.actual).toBe('Infinity')

      // Negative infinity test
      const negInfinityError = tests[2].failureReason as TestError
      selfTestsRunner.expect(negInfinityError.messageLocals.actual).toBe('-Infinity')

      // Float test
      const floatError = tests[3].failureReason as TestError
      selfTestsRunner.expect(floatError.messageLocals.actual).toBe('3.14')
    })

    selfTestsRunner.test('Should handle non-number types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String test', async () => {
        testsRunner.expect('NaN').toBeNaN() // String 'NaN' is not NaN
      })

      testsRunner.test('Null test', async () => {
        testsRunner.expect(null).toBeNaN()
      })

      testsRunner.test('Undefined test', async () => {
        testsRunner.expect(undefined).toBeNaN()
      })

      testsRunner.test('Object test', async () => {
        testsRunner.expect({}).toBeNaN()
      })

      await testsRunner.run()

      const tests = testsRunner.state.tests

      // String test
      const stringError = tests[0].failureReason as TestError
      selfTestsRunner.expect(stringError.messageLocals.actual).toBe('NaN')

      // Null test
      const nullError = tests[1].failureReason as TestError
      selfTestsRunner.expect(nullError.messageLocals.actual).toBe('null')

      // Undefined test
      const undefinedError = tests[2].failureReason as TestError
      selfTestsRunner.expect(undefinedError.messageLocals.actual).toBe('undefined')

      // Object test
      const objectError = tests[3].failureReason as TestError
      selfTestsRunner.expect(objectError.messageLocals.actual).toBe('Object')
    })

    selfTestsRunner.test('Should work with not.toBeNaN for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toBeNaN test', async () => {
        testsRunner.expect(42).not.toBeNaN()
        testsRunner.expect(0).not.toBeNaN()
        testsRunner.expect(Infinity).not.toBeNaN()
        testsRunner.expect(-Infinity).not.toBeNaN()
        testsRunner.expect(3.14).not.toBeNaN()
        testsRunner.expect('hello').not.toBeNaN()
        testsRunner.expect(null).not.toBeNaN()
        testsRunner.expect(undefined).not.toBeNaN()
        testsRunner.expect({}).not.toBeNaN()
        testsRunner.expect([]).not.toBeNaN()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toBeNaN when value is NaN', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toBeNaN test', async () => {
        testsRunner.expect(NaN).not.toBeNaN()
      })

      await testsRunner.run()

      const error = testsRunner.state.tests[0].failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected value not to be NaN, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({})
      selfTestsRunner.expect(error.expected).toBe('not NaN')
      // Note: Can't use .toBe(NaN) because NaN !== NaN
      selfTestsRunner.expect(Number.isNaN(error.actual)).toBe(true)
    })

    selfTestsRunner.test('Should use Number.isNaN internally (not global isNaN)', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Number.isNaN vs global isNaN test', async () => {
        // These would be true with global isNaN but false with Number.isNaN
        testsRunner.expect('NaN').not.toBeNaN() // String 'NaN'
        testsRunner.expect(undefined).not.toBeNaN() // undefined
        testsRunner.expect('not a number').not.toBeNaN() // String
        testsRunner.expect({}).not.toBeNaN() // Object

        // Only actual NaN should pass
        testsRunner.expect(NaN).toBeNaN()
        testsRunner.expect(Number.NaN).toBeNaN()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
