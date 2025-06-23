import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function beforeEachHooksFailureTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('BeforeEach hooks failure test', () => {
    selfTestsRunner.test('Should handle single beforeEach hook failure at global level', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Custom beforeEach error')

      testsRunner.beforeEach(async () => {
        throw customError
      })

      testsRunner.test('Should fail due to beforeEach hook failure', async () => {
        // This test should never execute
      })

      await testsRunner.run()

      // Check runner state
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })

    selfTestsRunner.test('Should handle multiple beforeEach hook failures at global level', async () => {
      const testsRunner = new TestsRunner()
      const firstError = new Error('First beforeEach error')
      const secondError = new Error('Second beforeEach error')

      testsRunner.beforeEach(async () => {
        throw firstError
      })

      testsRunner.beforeEach(async () => {
        throw secondError
      })

      testsRunner.test('Should fail due to multiple beforeEach hook failures', async () => {
        // This test should never execute
      })

      await testsRunner.run()

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(2)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(firstError)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[1]).toBe(secondError)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })

    selfTestsRunner.test('Should handle beforeEach hook failure in nested describe block', async () => {
      const testsRunner = new TestsRunner()
      const globalError = new Error('Global beforeEach error')
      const nestedError = new Error('Nested beforeEach error')

      testsRunner.beforeEach(async () => {
        throw globalError
      })

      testsRunner.describe('Nested describe', () => {
        testsRunner.beforeEach(async () => {
          throw nestedError
        })

        testsRunner.test('Should fail due to beforeEach hook failures', async () => {
          // This test should never execute
        })
      })

      await testsRunner.run()

      // Check test state - both global and nested beforeEach should run now
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(2)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(globalError)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[1]).toBe(nestedError)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })

    selfTestsRunner.test('Should handle beforeEach hook failure with successful beforeEach hooks', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const hookError = new Error('BeforeEach hook error')

      testsRunner.beforeEach(async () => {
        executionOrder.push('first beforeEach - success')
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('second beforeEach - will fail')
        throw hookError
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('third beforeEach - should execute')
      })

      testsRunner.test('Should fail due to beforeEach hook failure', async () => {
        executionOrder.push('test body - should not execute')
      })

      await testsRunner.run()

      // Check execution order - all beforeEach hooks at the same level execute
      selfTestsRunner.expect(executionOrder).toEqual(['first beforeEach - success', 'second beforeEach - will fail', 'third beforeEach - should execute'])

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(hookError)
    })

    selfTestsRunner.test('Should handle beforeEach hook failure affecting multiple tests', async () => {
      const testsRunner = new TestsRunner()
      const hookError = new Error('BeforeEach hook error')
      let hookCallCount = 0

      testsRunner.beforeEach(async () => {
        hookCallCount++
        throw hookError
      })

      testsRunner.test('First test - should fail', async () => {
        // Should not execute
      })

      testsRunner.test('Second test - should fail', async () => {
        // Should not execute
      })

      await testsRunner.run()

      // Check that beforeEach was called for each test
      selfTestsRunner.expect(hookCallCount).toBe(2)

      // Check both tests failed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)

      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
        selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
        selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(hookError)
        selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
      }
    })

    selfTestsRunner.test('Should handle beforeEach hook failure without afterEach hooks running', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const beforeEachError = new Error('BeforeEach hook error')

      testsRunner.beforeEach(async () => {
        executionOrder.push('beforeEach - failed')
        throw beforeEachError
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('afterEach - should not run')
      })

      testsRunner.test('Should fail due to beforeEach hook failure', async () => {
        executionOrder.push('test body - should not execute')
      })

      await testsRunner.run()

      // AfterEach should NOT run when beforeEach fails (preparation failure)
      selfTestsRunner.expect(executionOrder).toEqual(['beforeEach - failed'])

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(beforeEachError)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle async beforeEach hook failures', async () => {
      const testsRunner = new TestsRunner()
      const asyncError = new Error('Async beforeEach error')

      testsRunner.beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw asyncError
      })

      testsRunner.test('Should fail due to async beforeEach hook failure', async () => {
        // Should not execute
      })

      await testsRunner.run()

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(asyncError)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })

    selfTestsRunner.test('Should handle beforeEach hook failure in deeply nested describes', async () => {
      const testsRunner = new TestsRunner()
      const level1Error = new Error('Level 1 beforeEach error')
      const level2Error = new Error('Level 2 beforeEach error')
      const level3Error = new Error('Level 3 beforeEach error')

      testsRunner.beforeEach(async () => {
        throw level1Error
      })

      testsRunner.describe('Level 1', () => {
        testsRunner.beforeEach(async () => {
          throw level2Error
        })

        testsRunner.describe('Level 2', () => {
          testsRunner.beforeEach(async () => {
            throw level3Error
          })

          testsRunner.test('Deeply nested test - should fail', async () => {
            // Should not execute
          })
        })
      })

      await testsRunner.run()

      // Check test state - all three levels should fail now
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(3)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(level1Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[1]).toBe(level2Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[2]).toBe(level3Error)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })

    selfTestsRunner.test('Should preserve original test errors when no beforeEach hook failures', async () => {
      const testsRunner = new TestsRunner()
      const testError = new Error('Test execution error')

      testsRunner.beforeEach(async () => {
        // This should succeed
      })

      testsRunner.test('Should fail due to test error, not beforeEach', async () => {
        throw testError
      })

      await testsRunner.run()

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(0)
      selfTestsRunner.expect(testState.failureReason).toBe(testError)
    })

    selfTestsRunner.test('Should handle beforeEach hook failure with subsequent beforeEach hooks not running', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const globalError = new Error('Global beforeEach error')

      testsRunner.beforeEach(async () => {
        executionOrder.push('global beforeEach - success')
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('global beforeEach - will fail')
        throw globalError
      })

      testsRunner.describe('Nested describe', () => {
        testsRunner.beforeEach(async () => {
          executionOrder.push('nested beforeEach - should execute')
        })

        testsRunner.test('Nested test - should fail', async () => {
          executionOrder.push('test body - should not execute')
        })
      })

      await testsRunner.run()

      // All beforeEach hooks should run now, including nested ones
      selfTestsRunner.expect(executionOrder).toEqual(['global beforeEach - success', 'global beforeEach - will fail', 'nested beforeEach - should execute'])

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(globalError)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
