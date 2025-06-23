import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function afterHooksFailureTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('After hooks failure test', () => {
    selfTestsRunner.test('Should handle single after hook failure at global level', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Custom after hook error')
      const executionOrder: string[] = []

      testsRunner.after(async () => {
        executionOrder.push('after hook - will fail')
        throw customError
      })

      testsRunner.test('First test - should run and complete', async () => {
        executionOrder.push('first test')
      })

      testsRunner.test('Second test - should also run and complete', async () => {
        executionOrder.push('second test')
      })

      await testsRunner.run()

      // Check that tests run and complete, then after hook runs and fails
      selfTestsRunner.expect(executionOrder).toEqual(['first test', 'second test', 'after hook - will fail'])

      // Check runner state - should fail overall due to after hook error
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

      // Check that after hook error is tracked in the root node
      const internalRootNode = (testsRunner as any)._testingTree
      selfTestsRunner.expect(internalRootNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(internalRootNode.afterHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(internalRootNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook failure in describe block', async () => {
      const testsRunner = new TestsRunner()
      const customError = new Error('Describe after hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite with failing after hook', () => {
        testsRunner.after(async () => {
          executionOrder.push('describe after hook - will fail')
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

      // All tests should run, then after hook fails
      selfTestsRunner.expect(executionOrder).toEqual(['first test in describe', 'second test in describe', 'describe after hook - will fail', 'global test'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check individual test states - all tests should succeed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(3)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that after hook error is tracked in the describe node
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(customError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle multiple after hook failures in same describe', async () => {
      const testsRunner = new TestsRunner()
      const firstError = new Error('First after hook error')
      const secondError = new Error('Second after hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite with multiple failing after hooks', () => {
        testsRunner.after(async () => {
          executionOrder.push('first after hook - will fail')
          throw firstError
        })

        testsRunner.after(async () => {
          executionOrder.push('second after hook - will fail')
          throw secondError
        })

        testsRunner.test('Test should run first', async () => {
          executionOrder.push('test in describe')
        })
      })

      await testsRunner.run()

      // Test should run first, then all after hooks should run
      selfTestsRunner.expect(executionOrder).toEqual(['test in describe', 'first after hook - will fail', 'second after hook - will fail'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Test should still succeed
      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that both after hook errors are tracked in the describe node
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(2)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(firstError)
      selfTestsRunner.expect(describeNode.afterHooksErrors[1]).toBe(secondError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook failures in nested describe blocks', async () => {
      const testsRunner = new TestsRunner()
      const outerError = new Error('Outer after hook error')
      const innerError = new Error('Inner after hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Outer describe', () => {
        testsRunner.after(async () => {
          executionOrder.push('outer after hook - will fail')
          throw outerError
        })

        testsRunner.test('Outer test', async () => {
          executionOrder.push('outer test')
        })

        testsRunner.describe('Inner describe', () => {
          testsRunner.after(async () => {
            executionOrder.push('inner after hook - will fail')
            throw innerError
          })

          testsRunner.test('Inner test', async () => {
            executionOrder.push('inner test')
          })
        })
      })

      await testsRunner.run()

      // Tests run first, then after hooks in reverse order (inner first, then outer)
      selfTestsRunner.expect(executionOrder).toEqual(['outer test', 'inner test', 'inner after hook - will fail', 'outer after hook - will fail'])

      // Check runner state - should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Both tests should succeed individually
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that after hook errors are tracked in both describe nodes
      const internalRootNode = (testsRunner as any)._testingTree
      const outerDescribeNode = internalRootNode.children[0]
      const innerDescribeNode = outerDescribeNode.children[0]

      selfTestsRunner.expect(outerDescribeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(outerDescribeNode.afterHooksErrors[0]).toBe(outerError)
      selfTestsRunner.expect(outerDescribeNode.beforeHooksErrors).toHaveLength(0)

      selfTestsRunner.expect(innerDescribeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(innerDescribeNode.afterHooksErrors[0]).toBe(innerError)
      selfTestsRunner.expect(innerDescribeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should run after hooks only once per describe block', async () => {
      const testsRunner = new TestsRunner()
      let afterHookCallCount = 0
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.after(async () => {
          afterHookCallCount++
          executionOrder.push(`after hook - call ${afterHookCallCount}`)
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

      // After hook should only run once, after all tests complete
      selfTestsRunner.expect(afterHookCallCount).toBe(1)
      selfTestsRunner.expect(executionOrder).toEqual(['first test', 'second test', 'third test', 'after hook - call 1'])

      // All tests should succeed
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(3)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that no after hook errors are tracked (successful hook)
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(0)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook failure with successful before hooks', async () => {
      const testsRunner = new TestsRunner()
      const afterError = new Error('After hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          executionOrder.push('before hook - should run')
        })

        testsRunner.after(async () => {
          executionOrder.push('after hook - will fail')
          throw afterError
        })

        testsRunner.test('Test should run', async () => {
          executionOrder.push('test')
        })
      })

      await testsRunner.run()

      // Before hook runs, test runs, after hook runs and fails
      selfTestsRunner.expect(executionOrder).toEqual(['before hook - should run', 'test', 'after hook - will fail'])

      // Runner should fail overall but test should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that after hook error is tracked but no before hook errors
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(afterError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle async after hook failures', async () => {
      const testsRunner = new TestsRunner()
      const asyncError = new Error('Async after hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.after(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          executionOrder.push('async after hook - will fail')
          throw asyncError
        })

        testsRunner.test('Test should run', async () => {
          executionOrder.push('test')
        })
      })

      await testsRunner.run()

      selfTestsRunner.expect(executionOrder).toEqual(['test', 'async after hook - will fail'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that async after hook error is tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(asyncError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook failure mixed with test failures', async () => {
      const testsRunner = new TestsRunner()
      const afterError = new Error('After hook error')
      const testError = new Error('Test error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.after(async () => {
          executionOrder.push('after hook - will fail')
          throw afterError
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

      selfTestsRunner.expect(executionOrder).toEqual(['test - will fail', 'test - will succeed', 'after hook - will fail'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Check individual test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      selfTestsRunner.expect(testStates[0].status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testStates[0].failureReason).toBe(testError)
      selfTestsRunner.expect(testStates[1].status).toBe(TestStatus.Succeeded)

      // Check that after hook error is tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(afterError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook failure with beforeEach and afterEach hooks', async () => {
      const testsRunner = new TestsRunner()
      const afterError = new Error('After hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.beforeEach(async () => {
          executionOrder.push('beforeEach hook - should run for each test')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('afterEach hook - should run for each test')
        })

        testsRunner.after(async () => {
          executionOrder.push('after hook - will fail')
          throw afterError
        })

        testsRunner.test('First test', async () => {
          executionOrder.push('first test')
        })

        testsRunner.test('Second test', async () => {
          executionOrder.push('second test')
        })
      })

      await testsRunner.run()

      // beforeEach/afterEach run for each test, then after runs once and fails
      selfTestsRunner
        .expect(executionOrder)
        .toEqual([
          'beforeEach hook - should run for each test',
          'first test',
          'afterEach hook - should run for each test',
          'beforeEach hook - should run for each test',
          'second test',
          'afterEach hook - should run for each test',
          'after hook - will fail'
        ])

      // Runner should fail overall but tests should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(2)
      for (const testState of testStates) {
        selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)
      }

      // Check that after hook error is tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(afterError)
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(0)
    })

    selfTestsRunner.test('Should handle after hook execution order in deeply nested describes', async () => {
      const testsRunner = new TestsRunner()
      const level1Error = new Error('Level 1 after hook error')
      const level2Error = new Error('Level 2 after hook error')
      const level3Error = new Error('Level 3 after hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Level 1', () => {
        testsRunner.after(async () => {
          executionOrder.push('level 1 after hook - will fail')
          throw level1Error
        })

        testsRunner.describe('Level 2', () => {
          testsRunner.after(async () => {
            executionOrder.push('level 2 after hook - will fail')
            throw level2Error
          })

          testsRunner.describe('Level 3', () => {
            testsRunner.after(async () => {
              executionOrder.push('level 3 after hook - will fail')
              throw level3Error
            })

            testsRunner.test('Deeply nested test', async () => {
              executionOrder.push('deeply nested test')
            })
          })
        })
      })

      await testsRunner.run()

      // Test runs first, then after hooks in reverse order (innermost to outermost)
      selfTestsRunner.expect(executionOrder).toEqual(['deeply nested test', 'level 3 after hook - will fail', 'level 2 after hook - will fail', 'level 1 after hook - will fail'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that all nested after hook errors are tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const level1Node = internalRootNode.children[0]
      const level2Node = level1Node.children[0]
      const level3Node = level2Node.children[0]

      selfTestsRunner.expect(level1Node.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(level1Node.afterHooksErrors[0]).toBe(level1Error)
      selfTestsRunner.expect(level2Node.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(level2Node.afterHooksErrors[0]).toBe(level2Error)
      selfTestsRunner.expect(level3Node.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(level3Node.afterHooksErrors[0]).toBe(level3Error)
    })

    selfTestsRunner.test('Should handle mixed before and after hook failures', async () => {
      const testsRunner = new TestsRunner()
      const beforeError = new Error('Before hook error')
      const afterError = new Error('After hook error')
      const executionOrder: string[] = []

      testsRunner.describe('Test suite', () => {
        testsRunner.before(async () => {
          executionOrder.push('before hook - will fail')
          throw beforeError
        })

        testsRunner.after(async () => {
          executionOrder.push('after hook - will also fail')
          throw afterError
        })

        testsRunner.test('Test should still run', async () => {
          executionOrder.push('test')
        })
      })

      await testsRunner.run()

      // Both before and after hooks should run and fail, test should run
      selfTestsRunner.expect(executionOrder).toEqual(['before hook - will fail', 'test', 'after hook - will also fail'])

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testState = testsRunner.state.tests[0]
      selfTestsRunner.expect(testState.status).toBe(TestStatus.Succeeded)

      // Check that both before and after hook errors are tracked
      const internalRootNode = (testsRunner as any)._testingTree
      const describeNode = internalRootNode.children[0]
      selfTestsRunner.expect(describeNode.beforeHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.beforeHooksErrors[0]).toBe(beforeError)
      selfTestsRunner.expect(describeNode.afterHooksErrors).toHaveLength(1)
      selfTestsRunner.expect(describeNode.afterHooksErrors[0]).toBe(afterError)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
