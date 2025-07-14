import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toResolveTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toResolve assertion test', () => {
    selfTestsRunner.test('Should pass when promise resolves', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves test', async () => {
        const resolvingPromise = Promise.resolve('success')

        await testsRunner.expect(resolvingPromise).toResolve()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise rejects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise rejects test', async () => {
        const rejectingPromise = Promise.reject(new Error('Failed'))

        await testsRunner.expect(rejectingPromise).toResolve()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to resolve, but it rejected with {{error}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'instanceOf',
          representation: 'Promise'
        },
        error: {
          type: 'instanceOf',
          representation: 'Error'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a promise', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-promise value test', async () => {
        await testsRunner.expect('not a promise').toResolve()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a promise')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'string',
          representation: "'not a promise'"
        }
      })
    })

    selfTestsRunner.test('Should pass when promise resolves with expected value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with value test', async () => {
        const resolvingPromise = Promise.resolve('expected value')

        await testsRunner.expect(resolvingPromise).toResolve('expected value')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise resolves with unexpected value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with wrong value test', async () => {
        const resolvingPromise = Promise.resolve('actual value')

        await testsRunner.expect(resolvingPromise).toResolve('expected value')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to resolve with {{target}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'string',
          representation: "'expected value'"
        },
        actual: {
          type: 'instanceOf',
          representation: 'Promise'
        }
      })
    })

    selfTestsRunner.test('Should pass when promise resolves with complex expected value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with object test', async () => {
        const expectedObject = { name: 'test', value: 42 }
        const resolvingPromise = Promise.resolve({ name: 'test', value: 42 })

        await testsRunner.expect(resolvingPromise).toResolve(expectedObject)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when promise resolves with different complex value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with wrong object test', async () => {
        const expectedObject = { name: 'test', value: 42 }
        const resolvingPromise = Promise.resolve({ name: 'test', value: 43 })

        await testsRunner.expect(resolvingPromise).toResolve(expectedObject)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toResolve when promise resolves', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toResolve test', async () => {
        const resolvingPromise = Promise.resolve('success')

        await testsRunner.expect(resolvingPromise).not.toResolve()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to resolve, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'instanceOf',
          representation: 'Promise'
        }
      })
    })

    selfTestsRunner.test('Should pass with not.toResolve when promise rejects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toResolve test', async () => {
        const rejectingPromise = Promise.reject(new Error('Failed'))

        await testsRunner.expect(rejectingPromise).not.toResolve()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toResolve with specific value when promise rejects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toResolve with value test', async () => {
        const rejectingPromise = Promise.reject(new Error('Failed'))

        await testsRunner.expect(rejectingPromise).not.toResolve('specific value')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toResolve when promise resolves with the specific expected value', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toResolve with specific value test', async () => {
        const resolvingPromise = Promise.resolve('expected value')

        await testsRunner.expect(resolvingPromise).not.toResolve('expected value')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to resolve with {{target}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'string',
          representation: "'expected value'"
        },
        actual: {
          type: 'instanceOf',
          representation: 'Promise'
        }
      })
    })

    selfTestsRunner.test('Should pass with not.toResolve when promise resolves with different value than expected', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toResolve with different value test', async () => {
        const resolvingPromise = Promise.resolve('actual value')

        await testsRunner.expect(resolvingPromise).not.toResolve('expected value')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle async/await promises', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Async function test', async () => {
        const asyncFunction = async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          return 'async result'
        }

        await testsRunner.expect(asyncFunction()).toResolve('async result')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle promises that resolve with undefined', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with undefined test', async () => {
        const resolvingPromise = Promise.resolve(undefined)

        await testsRunner.expect(resolvingPromise).toResolve()
        await testsRunner.expect(resolvingPromise).toResolve(undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle promises that resolve with null', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with null test', async () => {
        const resolvingPromise = Promise.resolve(null)

        await testsRunner.expect(resolvingPromise).toResolve()
        await testsRunner.expect(resolvingPromise).toResolve(null)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle promises that resolve with falsy values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Promise resolves with falsy values test', async () => {
        await testsRunner.expect(Promise.resolve(0)).toResolve(0)
        await testsRunner.expect(Promise.resolve('')).toResolve('')
        await testsRunner.expect(Promise.resolve(false)).toResolve(false)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle thenable objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Thenable object test', async () => {
        const thenable = {
          then: (resolve: (value: any) => void) => {
            setTimeout(() => resolve('thenable result'), 10)
          }
        }

        await testsRunner.expect(thenable).toResolve('thenable result')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
