import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function afterEachHooksFailureTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('AfterEach hooks failure test', () => {
    selfTestsRunner.test('Should handle single afterEach hook failure at global level', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Custom afterEach error')

      testsRunner.afterEach(async () => {
        throw customError
      })

      testsRunner.test('Should fail due to afterEach hook failure', async () => {
        // Test body executes successfully
      })

      await testsRunner.run()

      // Check runner state
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
    })

    selfTestsRunner.test('Should handle multiple afterEach hook failures at global level', async () => {
      const testsRunner = new TestsRunner()
      const firstError = new Error('First afterEach error')
      const secondError = new Error('Second afterEach error')

      testsRunner.afterEach(async () => {
        throw firstError
      })

      testsRunner.afterEach(async () => {
        throw secondError
      })

      testsRunner.test('Should fail due to multiple afterEach hook failures', async () => {
        // Test body executes successfully
      })

      await testsRunner.run()

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(2)
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(firstError)
      selfTestsRunner.expect(testState.afterEachHooksErrors[1]).toBe(secondError)
      selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
    })

    selfTestsRunner.test('Should handle afterEach hook failure in nested describe block', async () => {
      const testsRunner = new TestsRunner()
      const globalError = new Error('Global afterEach error')
      const nestedError = new Error('Nested afterEach error')

      testsRunner.afterEach(async () => {
        throw globalError
      })

      testsRunner.describe('Nested describe', () => {
        testsRunner.afterEach(async () => {
          throw nestedError
        })

        testsRunner.test('Should fail due to afterEach hook failures', async () => {
          // Test body executes successfully
        })
      })

      await testsRunner.run()

      // Check test state - both global and nested afterEach should run
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(2)
      // afterEach runs in reverse order (nested first, then global)
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(nestedError)
      selfTestsRunner.expect(testState.afterEachHooksErrors[1]).toBe(globalError)
      selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
    })

    selfTestsRunner.test('Should handle afterEach hook execution order (reverse of nodePath)', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.afterEach(async () => {
        executionOrder.push('global afterEach [1]')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('global afterEach [2]')
      })

      testsRunner.describe('Level 1', () => {
        testsRunner.afterEach(async () => {
          executionOrder.push('level 1 afterEach [1]')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('level 1 afterEach [2]')
        })

        testsRunner.describe('Level 2', () => {
          testsRunner.afterEach(async () => {
            executionOrder.push('level 2 afterEach [1]')
          })

          testsRunner.test('Nested test', async () => {
            executionOrder.push('test body')
          })
        })
      })

      await testsRunner.run()

      // afterEach hooks should run in reverse order: innermost to outermost
      selfTestsRunner
        .expect(executionOrder)
        .toEqual(['test body', 'level 2 afterEach [1]', 'level 1 afterEach [1]', 'level 1 afterEach [2]', 'global afterEach [1]', 'global afterEach [2]'])

      // Test should succeed since no hooks failed
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle afterEach hook failure with successful afterEach hooks', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const hookError = new Error('AfterEach hook error')

      testsRunner.afterEach(async () => {
        executionOrder.push('first afterEach - success')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('second afterEach - will fail')
        throw hookError
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('third afterEach - should execute')
      })

      testsRunner.test('Should fail due to afterEach hook failure', async () => {
        executionOrder.push('test body')
      })

      await testsRunner.run()

      // All afterEach hooks should execute
      selfTestsRunner.expect(executionOrder).toEqual(['test body', 'first afterEach - success', 'second afterEach - will fail', 'third afterEach - should execute'])

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(hookError)
    })

    selfTestsRunner.test('Should handle afterEach hook failure affecting multiple tests', async () => {
      const testsRunner = new TestsRunner()
      const hookError = new Error('AfterEach hook error')
      let hookCallCount = 0

      testsRunner.afterEach(async () => {
        hookCallCount++
        throw hookError
      })

      testsRunner.test('First test - should fail', async () => {
        // Test body executes successfully
      })

      testsRunner.test('Second test - should fail', async () => {
        // Test body executes successfully
      })

      await testsRunner.run()

      // Check that afterEach was called for each test
      selfTestsRunner.expect(hookCallCount).toBe(2)

      // Check both tests failed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)

      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
        selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(1)
        selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(hookError)
        selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
      }
    })

    selfTestsRunner.test('Should handle afterEach hooks running even when test fails', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const testError = new Error('Test execution error')

      testsRunner.afterEach(async () => {
        executionOrder.push('afterEach - should still run')
      })

      testsRunner.test('Should fail in test body but afterEach should still run', async () => {
        executionOrder.push('test body - will fail')
        throw testError
      })

      await testsRunner.run()

      // AfterEach should run even when test fails
      selfTestsRunner.expect(executionOrder).toEqual(['test body - will fail', 'afterEach - should still run'])

      // Check test state - test should fail due to test error, not afterEach
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
      selfTestsRunner.expect(testState.failureReason).toBe(testError)
    })

    selfTestsRunner.test('Should handle afterEach hooks NOT running when beforeEach fails', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []
      const beforeEachError = new Error('BeforeEach hook error')

      testsRunner.beforeEach(async () => {
        executionOrder.push('beforeEach - will fail')
        throw beforeEachError
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('afterEach - should not run')
      })

      testsRunner.test('Should fail due to beforeEach, afterEach should not run', async () => {
        executionOrder.push('test body - should not execute')
      })

      await testsRunner.run()

      // Only beforeEach should run, afterEach should not (preparation failure)
      selfTestsRunner.expect(executionOrder).toEqual(['beforeEach - will fail'])

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(beforeEachError)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle async afterEach hook failures', async () => {
      const testsRunner = new TestsRunner()
      const asyncError = new Error('Async afterEach error')

      testsRunner.afterEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw asyncError
      })

      testsRunner.test('Should fail due to async afterEach hook failure', async () => {
        // Test body executes successfully
      })

      await testsRunner.run()

      // Check test state
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(asyncError)
      selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
    })

    selfTestsRunner.test('Should handle afterEach hook failure in deeply nested describes', async () => {
      const testsRunner = new TestsRunner()
      const level1Error = new Error('Level 1 afterEach error')
      const level2Error = new Error('Level 2 afterEach error')
      const level3Error = new Error('Level 3 afterEach error')

      testsRunner.afterEach(async () => {
        throw level1Error
      })

      testsRunner.describe('Level 1', () => {
        testsRunner.afterEach(async () => {
          throw level2Error
        })

        testsRunner.describe('Level 2', () => {
          testsRunner.afterEach(async () => {
            throw level3Error
          })

          testsRunner.test('Deeply nested test - should fail', async () => {
            // Test body executes successfully
          })
        })
      })

      await testsRunner.run()

      // Check test state - all three levels should fail, in reverse order
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(3)
      // afterEach runs in reverse order: innermost to outermost
      selfTestsRunner.expect(testState.afterEachHooksErrors[0]).toBe(level3Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors[1]).toBe(level2Error)
      selfTestsRunner.expect(testState.afterEachHooksErrors[2]).toBe(level1Error)
      selfTestsRunner.expect(testState.error?.message).toBe('afterEach hooks failed')
    })

    selfTestsRunner.test('Should handle mixed beforeEach and afterEach hook failures', async () => {
      const testsRunner = new TestsRunner()
      const beforeEachError = new Error('BeforeEach hook error')
      const afterEachError = new Error('AfterEach hook error')

      testsRunner.beforeEach(async () => {
        throw beforeEachError
      })

      testsRunner.afterEach(async () => {
        throw afterEachError
      })

      testsRunner.test('Should fail due to beforeEach, afterEach should not run', async () => {
        // Should not execute
      })

      await testsRunner.run()

      // Check test state - only beforeEach error should be present
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(testState.beforeEachHooksErrors[0]).toBe(beforeEachError)
      selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
      selfTestsRunner.expect(testState.error?.message).toBe('beforeEach hooks failed')
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
