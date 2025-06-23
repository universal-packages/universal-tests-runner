import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function beforeHooksFailureTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Before hooks failure test', () => {
    selfTestsRunner.test('Should handle single before hook failure at global level', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Custom before hook error')
      const executionOrder: string[] = []

      testsRunner.before(async () => {
        executionOrder.push('before hook - will fail')
        throw customError
      })

      testsRunner.test('First test - should run despite before hook failure', async () => {
        executionOrder.push('first test')
      })

      testsRunner.test('Second test - should also run', async () => {
        executionOrder.push('second test')
      })

      await testsRunner.run()

      // Check that tests still run despite before hook failure
      selfTestsRunner.expect(executionOrder).toEqual(['before hook - will fail', 'first test', 'second test'])

      // Check runner state - should fail overall due to before hook error
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check individual test states - tests should succeed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
        selfTestsRunner.expect(testState.beforeEachHooksErrors).toHaveLength(0)
        selfTestsRunner.expect(testState.afterEachHooksErrors).toHaveLength(0)
      }

      // Check the root node has the before hook error
      const rootNode = testsRunner.state.nodes
      selfTestsRunner.expect(rootNode.children).toHaveLength(0) // No describe blocks, so no children

      // Check that the before hook error is tracked in the internal testing tree
      const internalRootNode = (testsRunner as any)._testingTree
      selfTestsRunner.expect(internalRootNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(internalRootNode.beforeHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(internalRootNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle before hook failure in describe block', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Describe before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite with failing before hook', () => {
        testsRunner.before(async () => {
          executionOrder.push('describe before hook - will fail')
          throw customError
        })

        testsRunner.test('First test in describe - should run', async () => {
          executionOrder.push('first test in describe')
        })

        testsRunner.test('Second test in describe - should run', async () => {
          executionOrder.push('second test in describe')
        })
      })

      testsRunner.test('Global test - should run', async () => {
        executionOrder.push('global test')
      })

      await testsRunner.run()

      // All tests should run despite before hook failure
      selfTestsRunner.expect(executionOrder).toEqual(['describe before hook - will fail', 'first test in describe', 'second test in describe', 'global test'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check individual test states - all tests should succeed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(3)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that the before hook error is tracked in the describe node
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle multiple before hook failures in same describe', async () => {
      const testsRunner = new TestsRunner()
      const firstError = new Error('First before hook error')
      const secondError = new Error('Second before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite with multiple failing before hooks', () => {
        testsRunner.before(async () => {
          executionOrder.push('first before hook - will fail')
          throw firstError
        })

        testsRunner.before(async () => {
          executionOrder.push('second before hook - will fail')
          throw secondError
        })

        testsRunner.test('Test should still run', async () => {
          executionOrder.push('test in describe')
        })
      })

      await testsRunner.run()

      // All before hooks should run and test should still execute
      selfTestsRunner.expect(executionOrder).toEqual(['first before hook - will fail', 'second before hook - will fail', 'test in describe'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Test should still succeed
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that both before hook errors are tracked in the describe node
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(2)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(firstError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[1]).toBe(secondError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle before hook failures in nested describe blocks', async () => {
      const testsRunner = new TestsRunner()
      const outerError = new Error('Outer before hook error')
      const innerError = new Error('Inner before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Outer describe', () => {
        testsRunner.before(async () => {
          executionOrder.push('outer before hook - will fail')
          throw outerError
        })

        testsRunner.test('Outer test', async () => {
          executionOrder.push('outer test')
        })

        testsRunner.describe('Inner describe', () => {
          testsRunner.before(async () => {
            executionOrder.push('inner before hook - will fail')
            throw innerError
          })

          testsRunner.test('Inner test', async () => {
            executionOrder.push('inner test')
          })
        })
      })

      await testsRunner.run()

      // All hooks and tests should run
      selfTestsRunner.expect(executionOrder).toEqual(['outer before hook - will fail', 'outer test', 'inner before hook - will fail', 'inner test'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Both tests should succeed individually
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }
    })

    selfTestsRunner.test('Should run before hooks only once per describe block', async () => {
      const testsRunner = new TestsRunner()
      let beforeHookCallCount = 0
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          beforeHookCallCount++
          executionOrder.push(`before hook - call ${beforeHookCallCount}`)
        })

        testsRunner.test('First test', async () => {
          executionOrder.push('first test')
        })

        testsRunner.test('Second test', async () => {
          executionOrder.push('second test')
        })

        testsRunner.test('Third test', async () => {
          executionOrder.push('third test')
        })
      })

      await testsRunner.run()

      // Before hook should only run once, even with multiple tests
      selfTestsRunner.expect(beforeHookCallCount).toBe(1)
      selfTestsRunner.expect(executionOrder).toEqual(['before hook - call 1', 'first test', 'second test', 'third test'])

      // All tests should succeed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(3)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that no before hook errors are tracked (successful hook)
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle before hook failure with successful after hooks', async () => {
      const testsRunner = new TestsRunner()
      const beforeError = new Error('Before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          executionOrder.push('before hook - will fail')
          throw beforeError
        })

        testsRunner.after(async () => {
          executionOrder.push('after hook - should run')
        })

        testsRunner.test('Test should run', async () => {
          executionOrder.push('test')
        })
      })

      await testsRunner.run()

      // Before hook fails, test runs, after hook runs
      selfTestsRunner.expect(executionOrder).toEqual(['before hook - will fail', 'test', 'after hook - should run'])

      // Runner should fail overall but test should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that before hook error is tracked but no after hook errors
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(beforeError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle async before hook failures', async () => {
      const testsRunner = new TestsRunner()
      const asyncError = new Error('Async before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          executionOrder.push('async before hook - will fail')
          throw asyncError
        })

        testsRunner.test('Test should run', async () => {
          executionOrder.push('test')
        })
      })

      await testsRunner.run()

      selfTestsRunner.expect(executionOrder).toEqual(['async before hook - will fail', 'test'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that async before hook error is tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(asyncError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle before hook failure mixed with test failures', async () => {
      const testsRunner = new TestsRunner()
      const beforeError = new Error('Before hook error')
      const testError = new Error('Test error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          executionOrder.push('before hook - will fail')
          throw beforeError
        })

        testsRunner.test('Test that will also fail', async () => {
          executionOrder.push('test - will fail')
          throw testError
        })

        testsRunner.test('Test that will succeed', async () => {
          executionOrder.push('test - will succeed')
        })
      })

      await testsRunner.run()

      selfTestsRunner.expect(executionOrder).toEqual(['before hook - will fail', 'test - will fail', 'test - will succeed'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check individual test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      selfTestsRunner.expect(testStates[0].status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testStates[0].failureReason).toBe(testError)
      selfTestsRunner.expect(testStates[1].status).toBe(TestStatus.Succeeded)

      // Check that before hook error is tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(beforeError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle before hook failure with beforeEach hook success', async () => {
      const testsRunner = new TestsRunner()
      const beforeError = new Error('Before hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          executionOrder.push('before hook - will fail')
          throw beforeError
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('beforeEach hook - should run for each test')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('afterEach hook - should run for each test')
        })

        testsRunner.test('First test', async () => {
          executionOrder.push('first test')
        })

        testsRunner.test('Second test', async () => {
          executionOrder.push('second test')
        })
      })

      await testsRunner.run()

      // Before runs once and fails, beforeEach/afterEach run for each test
      selfTestsRunner
        .expect(executionOrder)
        .toEqual([
          'before hook - will fail',
          'beforeEach hook - should run for each test',
          'first test',
          'afterEach hook - should run for each test',
          'beforeEach hook - should run for each test',
          'second test',
          'afterEach hook - should run for each test'
        ])

      // Runner should fail overall but tests should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
