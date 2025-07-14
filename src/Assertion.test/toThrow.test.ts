import { TestError } from '../TestError'
import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function toThrowTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('toThrow assertion test', () => {
    selfTestsRunner.test('Should pass when function throws any error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function throws error test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when function does not throw', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Function does not throw test', async () => {
        const nonThrowingFunction = () => {
          return 'success'
        }

        testsRunner.expect(nonThrowingFunction).toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to throw, but it did not')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        }
      })
    })

    selfTestsRunner.test('Should fail when value is not a function', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-function value test', async () => {
        testsRunner.expect('not a function').toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to be a function')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'string',
          representation: "'not a function'"
        }
      })
    })

    selfTestsRunner.test('Should pass when function throws error matching string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String matching test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).toThrow('went wrong')
        testsRunner.expect(throwingFunction).toThrow('Something')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when function throws error not matching string', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('String not matching test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).toThrow('different error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} to throw {{target}}, but it threw {{error}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        target: {
          type: 'string',
          representation: "'different error'"
        },
        error: {
          type: 'instanceOf',
          representation: 'Error'
        }
      })
    })

    selfTestsRunner.test('Should pass when function throws error matching regex', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Regex matching test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).toThrow(/went wrong/)
        testsRunner.expect(throwingFunction).toThrow(/Something.*wrong/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when function throws error not matching regex', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Regex not matching test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).toThrow(/different/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass when function throws error matching Error object', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Error object matching test', async () => {
        const expectedError = new Error('Specific error message')
        const throwingFunction = () => {
          throw new Error('Specific error message')
        }

        testsRunner.expect(throwingFunction).toThrow(expectedError)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when function throws error not matching Error object', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Error object not matching test', async () => {
        const expectedError = new Error('Expected message')
        const throwingFunction = () => {
          throw new Error('Different message')
        }

        testsRunner.expect(throwingFunction).toThrow(expectedError)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should pass with not.toThrow when function does not throw', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toThrow test', async () => {
        const nonThrowingFunction = () => {
          return 'success'
        }

        testsRunner.expect(nonThrowingFunction).not.toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toThrow when function throws', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toThrow test', async () => {
        const throwingFunction = () => {
          throw new Error('Something went wrong')
        }

        testsRunner.expect(throwingFunction).not.toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to throw, but it threw {{error}}')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        error: {
          type: 'instanceOf',
          representation: 'Error'
        }
      })
    })

    selfTestsRunner.test('Should pass with not.toThrow when function throws non-matching error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.toThrow with specific error test', async () => {
        const throwingFunction = () => {
          throw new Error('Different error')
        }

        testsRunner.expect(throwingFunction).not.toThrow('specific error')
        testsRunner.expect(throwingFunction).not.toThrow(/specific/)
        testsRunner.expect(throwingFunction).not.toThrow(new Error('specific error'))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.toThrow when function throws matching error', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.toThrow with matching error test', async () => {
        const throwingFunction = () => {
          throw new Error('Specific error message')
        }

        testsRunner.expect(throwingFunction).not.toThrow('Specific error')
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const failedTest = testsRunner.state.tests[0]
      const error = failedTest.failureReason as TestError
      selfTestsRunner.expect(error.message).toBe('Expected {{actual}} not to throw {{target}}, but it did')
      selfTestsRunner.expect(error.messageLocals).toEqual({
        actual: {
          type: 'function',
          representation: '[Function]'
        },
        target: {
          type: 'string',
          representation: "'Specific error'"
        }
      })
    })

    selfTestsRunner.test('Should handle different error types', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Different error types test', async () => {
        const typeErrorFunction = () => {
          throw new TypeError('Type error')
        }
        const rangeErrorFunction = () => {
          throw new RangeError('Range error')
        }

        testsRunner.expect(typeErrorFunction).toThrow('Type error')
        testsRunner.expect(rangeErrorFunction).toThrow(/Range/)
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle functions that throw non-Error objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-Error object throwing test', async () => {
        const throwingFunction = () => {
          throw 'String error'
        }

        testsRunner.expect(throwingFunction).toThrow()
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
