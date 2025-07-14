import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenCalledWithTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenCalledWith assertion test', () => {
    selfTestsRunner.test('Should pass when mock function has been called with expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called with arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('arg1', 'arg2')

        testsRunner.expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called multiple times with matching arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called multiple times test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('arg1', 'arg2')
        mockFn('different', 'args')
        mockFn('arg1', 'arg2') // Called again with same args

        testsRunner.expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
        testsRunner.expect(mockFn).toHaveBeenCalledWith('different', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when mock function has not been called with expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function not called with arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('different', 'args')

        testsRunner.expect(mockFn).toHaveBeenCalledWith('expected', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have been called with {{args}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        args: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should fail when mock function has not been called at all', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function not called test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledWith('expected', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail when value is not a mock function', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-mock function value test', async () => {
        const regularFunction = () => {}

        testsRunner.expect(regularFunction).toHaveBeenCalledWith('args')
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

    selfTestsRunner.test('Should pass with complex argument types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const obj = { name: 'test', value: 42 }
        const arr = [1, 2, 3]

        mockFn(obj, arr, 'string', 123, true, null, undefined)

        testsRunner.expect(mockFn).toHaveBeenCalledWith(obj, arr, 'string', 123, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with similar but not equal objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object equality test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn({ name: 'test', value: 42 })

        testsRunner.expect(mockFn).toHaveBeenCalledWith({ name: 'test', value: 43 })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toHaveBeenCalledWith when arguments do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('different', 'args')

        testsRunner.expect(mockFn).not.toHaveBeenCalledWith('expected', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toHaveBeenCalledWith when function not called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenCalledWith not called test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).not.toHaveBeenCalledWith('any', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenCalledWith when arguments match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('matching', 'args')

        testsRunner.expect(mockFn).not.toHaveBeenCalledWith('matching', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have been called with {{args}}, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        args: {
          type: 'array',
          representation: '[Array]'
        }
      })
    })

    selfTestsRunner.test('Should handle no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledWith()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when called with no arguments but expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments but expected arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenCalledWith('expected')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail when called with arguments but expected no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Arguments but expected no arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('unexpected')

        testsRunner.expect(mockFn).toHaveBeenCalledWith()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle nested objects and arrays', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nested structures test', async () => {
        const mockFn = testsRunner.mockFn()
        const complex = {
          user: { name: 'test', preferences: { theme: 'dark' } },
          items: [
            { id: 1, tags: ['a', 'b'] },
            { id: 2, tags: ['c'] }
          ]
        }

        mockFn(complex)

        testsRunner.expect(mockFn).toHaveBeenCalledWith(complex)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle function arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const callback = () => 'callback'

        mockFn('data', callback)

        testsRunner.expect(mockFn).toHaveBeenCalledWith('data', callback)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with different primitive types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different primitive types test', async () => {
        const mockFn = testsRunner.mockFn()

        mockFn('string', 42, true, null, undefined)

        testsRunner.expect(mockFn).toHaveBeenCalledWith('string', 42, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
