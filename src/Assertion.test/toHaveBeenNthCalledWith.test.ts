import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toHaveBeenNthCalledWithTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toHaveBeenNthCalledWith assertion test', () => {
    selfTestsRunner.test('Should pass when nth call matches expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nth call matches test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('second', 'call')
        mockFn('third', 'call')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(1, 'first', 'call')
        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'second', 'call')
        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(3, 'third', 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when nth call does not match expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Nth call does not match test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('second', 'call')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(1, 'wrong', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{n}}th call to have been called with {{expected}}, but it was called with {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        n: '1',
        expected: 'Array',
        actual: 'Array'
      })
    })

    selfTestsRunner.test('Should fail when not enough calls have been made', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not enough calls test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('only', 'call')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(3, 'any', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected mock function to have been called at least {{expected}} times, but it was called {{actual}} times')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        expected: '3',
        actual: '1'
      })
    })

    selfTestsRunner.test('Should fail when n is not a positive integer', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Invalid n value test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('call')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(0, 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('N must be a positive integer')
    })

    selfTestsRunner.test('Should fail when n is negative', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negative n value test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('call')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(-1, 'call')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('N must be a positive integer')
    })

    selfTestsRunner.test('Should fail when value is not a mock function', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-mock function value test', async () => {
        const regularFunction = () => {}

        testsRunner.expect(regularFunction).toHaveBeenNthCalledWith(1, 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected a mock function, but got {{actual}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: '()=>{}'
      })
    })

    selfTestsRunner.test('Should pass with complex argument types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const obj = { name: 'test', value: 42 }
        const arr = [1, 2, 3]

        mockFn('first')
        mockFn(obj, arr, 'string', 123, true, null, undefined)
        mockFn('third')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, obj, arr, 'string', 123, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with similar but not equal objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Object equality test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first')
        mockFn({ name: 'test', value: 42 })

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, { name: 'test', value: 43 })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toHaveBeenNthCalledWith when arguments do not match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toHaveBeenNthCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('second', 'call')

        testsRunner.expect(mockFn).not.toHaveBeenNthCalledWith(1, 'wrong', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toHaveBeenNthCalledWith when arguments match', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toHaveBeenNthCalledWith test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first', 'call')
        mockFn('matching', 'args')

        testsRunner.expect(mockFn).not.toHaveBeenNthCalledWith(2, 'matching', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{n}}th call not to have been called with given arguments, but it was')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        n: '2'
      })
    })

    selfTestsRunner.test('Should handle no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first')
        mockFn()
        mockFn('third')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when nth call has no arguments but expected arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('No arguments but expected arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first')
        mockFn()

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'expected')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail when nth call has arguments but expected no arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Arguments but expected no arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('first')
        mockFn('unexpected')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2)
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

        mockFn('first')
        mockFn(complex)
        mockFn('third')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, complex)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle function arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function arguments test', async () => {
        const mockFn = testsRunner.mockFn()
        const callback = () => 'callback'

        mockFn('first')
        mockFn('data', callback)
        mockFn('third')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'data', callback)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with different primitive types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different primitive types test', async () => {
        const mockFn = testsRunner.mockFn()

        mockFn('first')
        mockFn('string', 42, true, null, undefined)
        mockFn('third')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'string', 42, true, null, undefined)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with first call (n=1)', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('First call test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('very', 'first')
        mockFn('second')

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(1, 'very', 'first')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with large call numbers', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Large call number test', async () => {
        const mockFn = testsRunner.mockFn()

        // Make 10 calls
        for (let i = 1; i <= 10; i++) {
          mockFn(`call-${i}`)
        }

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(7, 'call-7')
        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(10, 'call-10')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should distinguish between different calls with same arguments', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Same arguments different calls test', async () => {
        const mockFn = testsRunner.mockFn()
        mockFn('same', 'args')
        mockFn('different', 'args')
        mockFn('same', 'args') // Same as first call

        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(1, 'same', 'args')
        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'different', 'args')
        testsRunner.expect(mockFn).toHaveBeenNthCalledWith(3, 'same', 'args')

        // Should fail for wrong position
        testsRunner.expect(mockFn).not.toHaveBeenNthCalledWith(2, 'same', 'args')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
