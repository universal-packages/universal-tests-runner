import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toRejectTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toReject assertion test', () => {
    selfTestsRunner.test('Should pass when promise rejects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects test', async () => {
        const rejectingPromise = Promise.reject(new Error('Failed'))

        await testsRunner.expect(rejectingPromise).toReject()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise resolves', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves test', async () => {
        const resolvingPromise = Promise.resolve('success')

        await testsRunner.expect(resolvingPromise).toReject()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected promise to reject, but it resolved with {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: 'success'
      })
    })

    selfTestsRunner.test('Should fail when value is not a promise', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-promise value test', async () => {
        await testsRunner.expect('not a promise').toReject()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected a promise, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: 'not a promise'
      })
    })

    selfTestsRunner.test('Should pass when promise rejects with expected string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with string test', async () => {
        const rejectingPromise = Promise.reject(new Error('Something went wrong'))

        await testsRunner.expect(rejectingPromise).toReject('went wrong')
        await testsRunner.expect(rejectingPromise).toReject('Something')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise rejects with different string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with wrong string test', async () => {
        const rejectingPromise = Promise.reject(new Error('Something went wrong'))

        await testsRunner.expect(rejectingPromise).toReject('different error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected promise to reject with {{expected}}, but it rejected with {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'different error',
        actual: 'Something went wrong'
      })
    })

    selfTestsRunner.test('Should pass when promise rejects with expected regex', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with regex test', async () => {
        const rejectingPromise = Promise.reject(new Error('Something went wrong'))

        await testsRunner.expect(rejectingPromise).toReject(/went wrong/)
        await testsRunner.expect(rejectingPromise).toReject(/Something.*wrong/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise rejects with non-matching regex', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with wrong regex test', async () => {
        const rejectingPromise = Promise.reject(new Error('Something went wrong'))

        await testsRunner.expect(rejectingPromise).toReject(/different/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass when promise rejects with expected Error object', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with Error object test', async () => {
        const expectedError = new Error('Specific error message')
        const rejectingPromise = Promise.reject(new Error('Specific error message'))

        await testsRunner.expect(rejectingPromise).toReject(expectedError)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise rejects with different Error object', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with wrong Error object test', async () => {
        const expectedError = new Error('Expected message')
        const rejectingPromise = Promise.reject(new Error('Different message'))

        await testsRunner.expect(rejectingPromise).toReject(expectedError)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toReject when promise resolves', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toReject test', async () => {
        const resolvingPromise = Promise.resolve('success')

        await testsRunner.expect(resolvingPromise).not.toReject()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toReject when promise rejects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toReject test', async () => {
        const rejectingPromise = Promise.reject(new Error('Failed'))

        await testsRunner.expect(rejectingPromise).not.toReject()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected promise not to reject, but it rejected with {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: 'Failed'
      })
    })

    selfTestsRunner.test('Should pass with not.toReject when promise rejects with different error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toReject with different error test', async () => {
        const rejectingPromise = Promise.reject(new Error('Different error'))

        await testsRunner.expect(rejectingPromise).not.toReject('specific error')
        await testsRunner.expect(rejectingPromise).not.toReject(/specific/)
        await testsRunner.expect(rejectingPromise).not.toReject(new Error('specific error'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toReject when promise rejects with matching error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toReject with matching error test', async () => {
        const rejectingPromise = Promise.reject(new Error('Specific error message'))

        await testsRunner.expect(rejectingPromise).not.toReject('Specific error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected promise not to reject with {{expected}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: 'Specific error'
      })
    })

    selfTestsRunner.test('Should handle async/await promises that reject', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Async function reject test', async () => {
        const asyncFunction = async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          throw new Error('Async error')
        }

        await testsRunner.expect(asyncFunction()).toReject('Async error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle promises that reject with non-Error objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects with string test', async () => {
        const rejectingPromise = Promise.reject('String error')

        await testsRunner.expect(rejectingPromise).toReject()
        await testsRunner.expect(rejectingPromise).toReject('String error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle different error types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different error types test', async () => {
        const typeErrorPromise = Promise.reject(new TypeError('Type error'))
        const rangeErrorPromise = Promise.reject(new RangeError('Range error'))

        await testsRunner.expect(typeErrorPromise).toReject('Type error')
        await testsRunner.expect(rangeErrorPromise).toReject(/Range/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle thenable objects that reject', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Thenable object reject test', async () => {
        const thenable = {
          then: (resolve: (value: any) => void, reject: (error: any) => void) => {
            setTimeout(() => reject(new Error('Thenable error')), 10)
          }
        }

        await testsRunner.expect(thenable).toReject('Thenable error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toReject when promise resolves regardless of expected error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toReject with resolved promise test', async () => {
        const resolvingPromise = Promise.resolve('success')

        await testsRunner.expect(resolvingPromise).not.toReject('any error')
        await testsRunner.expect(resolvingPromise).not.toReject(/any/)
        await testsRunner.expect(resolvingPromise).not.toReject(new Error('any error'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
