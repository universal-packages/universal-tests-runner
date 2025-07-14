import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenCalledTimesWithTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenCalledTimesWith assertion test', () => {
    selfTestsRunner.test('Should pass when mock function has been called exact times with specific arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called exact times with args test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('test', 42)
        mockFn('different', 'args')
        mockFn('test', 42)

        testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(2, 'test', 42)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called zero times with specific arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called zero times with args test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('different', 'args')
        mockFn('other', 'arguments')

        testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(0, 'never', 'called')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when mock function has been called different number of times with specific arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called wrong times with args test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('test', 42)
        mockFn('test', 42)

        testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(3, 'test', 42)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have been called {{target}} times with {{args}}, but it was called {{count}} times')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        target: {
          type: 'number',
          representation: '3'
        },
        args: {
          type: 'array',
          representation: '[Array]'
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

        testsRunner.expect(regularFunction).toHaveBeenCalledTimesWith(1, 'args')
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

    selfTestsRunner.test('Should pass with not.toHaveBeenCalledTimesWith when call count is different', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenCalledTimesWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('test', 42)
        mockFn('test', 42)

        testsRunner.expect(mockFn).not.toHaveBeenCalledTimesWith(3, 'test', 42)
        testsRunner.expect(mockFn).not.toHaveBeenCalledTimesWith(1, 'test', 42)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenCalledTimesWith when call count matches', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenCalledTimesWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('test', 42)
        mockFn('test', 42)

        testsRunner.expect(mockFn).not.toHaveBeenCalledTimesWith(2, 'test', 42)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have been called {{target}} times with {{args}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        target: {
          type: 'number',
          representation: '2'
        },
        args: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should handle complex argument types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const obj = { name: 'test', value: 42 }
        const arr = [1, 2, 3]

        mockFn(obj, arr)
        mockFn('different', 'call')
        mockFn(obj, arr)
        mockFn(obj, arr)

        testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(3, obj, arr)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn('with', 'args')
        mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(3)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
