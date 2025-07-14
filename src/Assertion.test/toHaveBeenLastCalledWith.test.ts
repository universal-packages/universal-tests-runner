import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenLastCalledWithTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenLastCalledWith assertion test', () => {
    selfTestsRunner.test('Should pass when mock function last call matches expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function last call matches test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('second', 'call')
        mockFn('last', 'call')

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('last', 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when mock function has been called only once', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function called once test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('only', 'call')

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('only', 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when mock function last call does not match expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function last call mismatch test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('second', 'call')
        mockFn('last', 'call')

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('expected', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to have been called last with {{args}}')
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

    selfTestsRunner.test('Should fail when mock function has not been called', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function not called test', async () => {
        const mockFn = testsRunner.mockFn()

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('expected', 'args')
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

        testsRunner.expect(regularFunction).toHaveBeenLastCalledWith('args')
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

        mockFn('first', 'call')
        mockFn(obj, arr, 'string', 123, true, null, undefined)

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith(obj, arr, 'string', 123, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with similar but not equal objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object equality test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn({ name: 'test', value: 42 })

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith({ name: 'test', value: 43 })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toHaveBeenLastCalledWith when arguments do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenLastCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('last', 'call')

        testsRunner.expect(mockFn).not.toHaveBeenLastCalledWith('first', 'call')
        testsRunner.expect(mockFn).not.toHaveBeenLastCalledWith('different', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenLastCalledWith when arguments match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenLastCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('matching', 'args')

        testsRunner.expect(mockFn).not.toHaveBeenLastCalledWith('matching', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to have been called last with {{args}}, but it was')
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
        mockFn('with', 'args')
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when last call had no arguments but expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments but expected arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('with', 'args')
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('expected')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail when last call had arguments but expected no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Arguments but expected no arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn()
        mockFn('unexpected')

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith()
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

        mockFn('first', 'call')
        mockFn(complex)

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith(complex)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle function arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const callback = () => 'callback'

        mockFn('first', 'call')
        mockFn('data', callback)

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('data', callback)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with different primitive types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different primitive types test', async () => {
        const mockFn = testsRunner.mockFn()

        mockFn('first', 'call')
        mockFn('string', 42, true, null, undefined)

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('string', 42, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should update when new calls are made', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Last call updates test', async () => {
        const mockFn = testsRunner.mockFn()

        mockFn('first', 'call')
        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('first', 'call')

        mockFn('second', 'call')
        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('second', 'call')
        testsRunner.expect(mockFn).not.toHaveBeenLastCalledWith('first', 'call')

        mockFn('third', 'call')
        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('third', 'call')
        testsRunner.expect(mockFn).not.toHaveBeenLastCalledWith('second', 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work after mock function calls are cleared', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Mock function mockClear test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn.implement(() => 'value')
        mockFn('old', 'call')

        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('old', 'call')

        mockFn.mockClear()

        // After clearing, should fail because no calls
        try {
          testsRunner.expect(mockFn).toHaveBeenLastCalledWith('any', 'args')
          selfTestsRunner.expect(false).toBe(true) // Should not reach here
        } catch (e) {
          // Expected to fail
        }

        // Make a new call
        mockFn('new', 'call')
        testsRunner.expect(mockFn).toHaveBeenLastCalledWith('new', 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
