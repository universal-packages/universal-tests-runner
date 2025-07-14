import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenCalledTimesTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenCalledTimes assertion test', () => {
    selfTestsRunner.test('Should pass when mock function has been called exact number of times', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called exact times test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(3)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called zero times', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called zero times test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called once', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called once test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when mock function has been called different number of times', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called wrong times test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(3)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have been called {{target}} times, but it was called {{count}} times')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        target: {
          type: 'number',
          representation: '3'
        },
        actual: {
          type: 'number',
          representation: '2'
        },
        count: {
          type: 'number',
          representation: '2'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a mock function', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-mock function value test', async () => {
        const regularFunction = () => {}

        testsRunner.expect(regularFunction).toHaveBeenCalledTimes(1)
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

    selfTestsRunner.test('Should pass with not.toHaveBeenCalledTimes when call count is different', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenCalledTimes test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalledTimes(3)
        testsRunner.expect(mockFn).not.toHaveBeenCalledTimes(1)
        testsRunner.expect(mockFn).not.toHaveBeenCalledTimes(0)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenCalledTimes when call count matches', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenCalledTimes test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalledTimes(2)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have been called {{target}} times, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        target: {
          type: 'number',
          representation: '2'
        }
      })
    })

    selfTestsRunner.test('Should work with mock function called with different arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called with different arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('arg1')
        mockFn('arg2')
        mockFn(42)
        mockFn({ name: 'test' })

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(4)
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
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(3)

        mockFn.reset()
        testsRunner.expect(mockFn).toHaveBeenCalledTimes(0)
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
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(2)

        mockFn.mockClear()
        testsRunner.expect(mockFn).toHaveBeenCalledTimes(0)

        // Implementation should still be there
        mockFn()
        testsRunner.expect(mockFn).toHaveBeenCalledTimes(1)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle large number of calls', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Large number of calls test', async () => {
        const mockFn = testsRunner.mockFn()

        for (let i = 0; i < 100; i++) {
          mockFn(i)
        }

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(100)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with mock function that throws', async () => {
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

        try {
          mockFn()
        } catch (e) {
          // Expected to throw
        }

        testsRunner.expect(mockFn).toHaveBeenCalledTimes(2)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with mock function that returns different values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function with different return values test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn.implementOnce(() => 'first')
        mockFn.implementOnce(() => 'second')
        mockFn.implement(() => 'default')

        const result1 = mockFn()
        const result2 = mockFn()
        const result3 = mockFn()

        testsRunner.expect(result1).toBe('first')
        testsRunner.expect(result2).toBe('second')
        testsRunner.expect(result3).toBe('default')
        testsRunner.expect(mockFn).toHaveBeenCalledTimes(3)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
