import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenCalledTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenCalled assertion test', () => {
    selfTestsRunner.test('Should pass when mock function has been called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called multiple times', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called multiple times test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when mock function has not been called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function not called test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have been called, but it was not called')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a mock function', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-mock function value test', async () => {
        const regularFunction = () => {}

        testsRunner.expect(regularFunction).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a mock function')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a function at all', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-function value test', async () => {
        testsRunner.expect('not a function').toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a mock function')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'string',
          representation: "'not a function'"
        }
      })
    })

    selfTestsRunner.test('Should pass with not.toHaveBeenCalled when mock function has not been called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenCalled test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenCalled when mock function has been called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenCalled test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have been called, but it was called {{count}} times')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        count: {
          type: 'number',
          representation: '1'
        }
      })
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenCalled when mock function has been called multiple times', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenCalled multiple calls test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        count: {
          type: 'number',
          representation: '3'
        }
      })
    })

    selfTestsRunner.test('Should work with mock function calls with arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called with arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('arg1', 'arg2')
        mockFn(42, true)

        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with mock function that returns values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function with return values test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn.implement(() => 'return value')

        const result = mockFn()
        testsRunner.expect(result).toBe('return value')
        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with mock function that throws errors', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function that throws test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn.implement(() => {
          throw new Error('Mock error')
        })

        try {
          mockFn()
        } catch (e) {
          // Expected to throw
        }

        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work after mock function is reset', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function reset test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalled()

        mockFn.reset()
        testsRunner.expect(mockFn).not.toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work after mock function calls are cleared', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function mockClear test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn.implement(() => 'value')
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalled()

        mockFn.mockClear()
        testsRunner.expect(mockFn).not.toHaveBeenCalled()

        // Implementation should still be there
        const result = mockFn()
        testsRunner.expect(result).toBe('value')
        testsRunner.expect(mockFn).toHaveBeenCalled()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
