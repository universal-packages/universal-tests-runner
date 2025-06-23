import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function parallelOrderTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Parallel order test', () => {
    selfTestsRunner.test('Should run tests in parallel when runOrder is parallel', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []
      const executionTimes: Record<string, number> = {}

      testsRunner.test('Test A (100ms)', async () => {
        const startTime = Date.now()
        await new Promise((resolve) => setTimeout(resolve, 100))
        executionOrder.push('Test A')
        executionTimes['Test A'] = Date.now() - startTime
      })

      testsRunner.test('Test B (50ms)', async () => {
        const startTime = Date.now()
        await new Promise((resolve) => setTimeout(resolve, 50))
        executionOrder.push('Test B')
        executionTimes['Test B'] = Date.now() - startTime
      })

      testsRunner.test('Test C (25ms)', async () => {
        const startTime = Date.now()
        await new Promise((resolve) => setTimeout(resolve, 25))
        executionOrder.push('Test C')
        executionTimes['Test C'] = Date.now() - startTime
      })

      const overallStartTime = Date.now()
      await testsRunner.run()
      const overallTime = Date.now() - overallStartTime

      // All tests should be present
      selfTestsRunner.expect(executionOrder).toHaveLength(3)
      selfTestsRunner.expect(executionOrder).toContain('Test A')
      selfTestsRunner.expect(executionOrder).toContain('Test B')
      selfTestsRunner.expect(executionOrder).toContain('Test C')

      // In parallel mode, shorter tests should complete first
      // Test C (25ms) should finish before Test B (50ms) which should finish before Test A (100ms)
      const testCIndex = executionOrder.indexOf('Test C')
      const testBIndex = executionOrder.indexOf('Test B')
      const testAIndex = executionOrder.indexOf('Test A')

      selfTestsRunner.expect(testCIndex).toBeLessThan(testBIndex)
      selfTestsRunner.expect(testBIndex).toBeLessThan(testAIndex)

      // Total time should be closer to the longest test (100ms) rather than sum (175ms)
      // Allow some margin for execution overhead
      selfTestsRunner.expect(overallTime).toBeLessThan(150) // Much less than 175ms sequential
      selfTestsRunner.expect(overallTime).toBeGreaterThan(90) // At least as long as longest test
    })

    selfTestsRunner.test('Should maintain hook execution order with parallel tests', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.before(async () => {
        executionOrder.push('Global before')
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('Global beforeEach')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('Global afterEach')
      })

      testsRunner.after(async () => {
        executionOrder.push('Global after')
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      testsRunner.test('Parallel test 1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 30))
        executionOrder.push('Parallel test 1')
      })

      testsRunner.test('Parallel test 2', async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        executionOrder.push('Parallel test 2')
      })

      await testsRunner.run()

      // Global before should run first
      selfTestsRunner.expect(executionOrder[0]).toBe('Global before')

      // Global after should run last
      selfTestsRunner.expect(executionOrder[executionOrder.length - 1]).toBe('Global after')

      // Each test should be surrounded by beforeEach and afterEach
      const test1Index = executionOrder.indexOf('Parallel test 1')
      const test2Index = executionOrder.indexOf('Parallel test 2')

      selfTestsRunner.expect(test1Index).toBeGreaterThan(0)
      selfTestsRunner.expect(test2Index).toBeGreaterThan(0)

      // Count beforeEach and afterEach calls
      const beforeEachCount = executionOrder.filter((item) => item === 'Global beforeEach').length
      const afterEachCount = executionOrder.filter((item) => item === 'Global afterEach').length

      selfTestsRunner.expect(beforeEachCount).toBe(2) // Once per test
      selfTestsRunner.expect(afterEachCount).toBe(2) // Once per test
    })

    selfTestsRunner.test('Should handle errors in parallel execution', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.test('Failing test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        executionOrder.push('Failing test')
        throw new Error('Test failure')
      })

      testsRunner.test('Passing test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        executionOrder.push('Passing test')
      })

      testsRunner.test('Another passing test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        executionOrder.push('Another passing test')
      })

      await testsRunner.run()

      // All tests should execute despite one failing
      selfTestsRunner.expect(executionOrder).toHaveLength(3)
      selfTestsRunner.expect(executionOrder).toContain('Failing test')
      selfTestsRunner.expect(executionOrder).toContain('Passing test')
      selfTestsRunner.expect(executionOrder).toContain('Another passing test')

      // Runner should fail overall due to the failing test
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      // Shortest test should complete first
      selfTestsRunner.expect(executionOrder[0]).toBe('Another passing test')
    })

    selfTestsRunner.test('Should execute tests in parallel without interference', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      let test1Counter = 0
      let test2Counter = 0
      let test3Counter = 0

      testsRunner.test('Test increments local counter (parallel 1)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 30))
        test1Counter += 1
        selfTestsRunner.expect(test1Counter).toBe(1)
      })

      testsRunner.test('Test increments different counter (parallel 2)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        test2Counter += 1
        selfTestsRunner.expect(test2Counter).toBe(1)
      })

      testsRunner.test('Test increments third counter (parallel 3)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        test3Counter += 1
        selfTestsRunner.expect(test3Counter).toBe(1)
      })

      await testsRunner.run()

      // All tests should pass, proving parallel execution works
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)

      // Verify all counters were incremented
      selfTestsRunner.expect(test1Counter).toBe(1)
      selfTestsRunner.expect(test2Counter).toBe(1)
      selfTestsRunner.expect(test3Counter).toBe(1)
    })

    selfTestsRunner.test('Should handle describe blocks in parallel execution', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.describe('Group A', () => {
        testsRunner.before(async () => {
          executionOrder.push('Group A before')
        })

        testsRunner.test('Group A Test 1 (40ms)', async () => {
          await new Promise((resolve) => setTimeout(resolve, 40))
          executionOrder.push('Group A Test 1')
        })

        testsRunner.test('Group A Test 2 (20ms)', async () => {
          await new Promise((resolve) => setTimeout(resolve, 20))
          executionOrder.push('Group A Test 2')
        })

        testsRunner.after(async () => {
          executionOrder.push('Group A after')
        })
      })

      testsRunner.describe('Group B', () => {
        testsRunner.test('Group B Test 1 (10ms)', async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          executionOrder.push('Group B Test 1')
        })
      })

      await testsRunner.run()

      // Before hooks should run before their respective tests
      const groupABeforeIndex = executionOrder.indexOf('Group A before')
      const groupATest1Index = executionOrder.indexOf('Group A Test 1')
      const groupATest2Index = executionOrder.indexOf('Group A Test 2')
      const groupAAfterIndex = executionOrder.indexOf('Group A after')

      selfTestsRunner.expect(groupABeforeIndex).toBeLessThan(groupATest1Index)
      selfTestsRunner.expect(groupABeforeIndex).toBeLessThan(groupATest2Index)
      selfTestsRunner.expect(groupAAfterIndex).toBeGreaterThan(groupATest1Index)
      selfTestsRunner.expect(groupAAfterIndex).toBeGreaterThan(groupATest2Index)

      // In parallel execution, shorter tests should complete first
      // Group B Test 1 (10ms) should complete before Group A Test 1 (40ms)
      const groupBTest1Index = executionOrder.indexOf('Group B Test 1')
      const groupATest1Index2 = executionOrder.indexOf('Group A Test 1')

      selfTestsRunner.expect(groupBTest1Index).toBeLessThan(groupATest1Index2)
    })

    selfTestsRunner.test('Should be faster than sequential execution', async () => {
      // Test sequential execution time
      const sequentialRunner = new TestsRunner({ runOrder: 'sequence' })

      sequentialRunner.test('Sequential test 1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      sequentialRunner.test('Sequential test 2', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      sequentialRunner.test('Sequential test 3', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      const sequentialStart = Date.now()
      await sequentialRunner.run()
      const sequentialTime = Date.now() - sequentialStart

      // Test parallel execution time
      const parallelRunner = new TestsRunner({ runOrder: 'parallel' })

      parallelRunner.test('Parallel test 1', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      parallelRunner.test('Parallel test 2', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      parallelRunner.test('Parallel test 3', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      const parallelStart = Date.now()
      await parallelRunner.run()
      const parallelTime = Date.now() - parallelStart

      // Parallel should be significantly faster than sequential
      // Sequential: ~150ms, Parallel: ~50ms
      selfTestsRunner.expect(parallelTime).toBeLessThan(sequentialTime * 0.7) // At least 30% faster
      selfTestsRunner.expect(sequentialTime).toBeGreaterThan(140) // Sequential should be ~150ms
      selfTestsRunner.expect(parallelTime).toBeLessThan(80) // Parallel should be ~50ms
    })

    selfTestsRunner.test('Should handle mixed async and sync tests in parallel', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.test('Sync test', () => {
        executionOrder.push('Sync test')
      })

      testsRunner.test('Async test (30ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 30))
        executionOrder.push('Async test')
      })

      testsRunner.test('Another sync test', () => {
        executionOrder.push('Another sync test')
      })

      testsRunner.test('Quick async test (5ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        executionOrder.push('Quick async test')
      })

      await testsRunner.run()

      // All tests should execute
      selfTestsRunner.expect(executionOrder).toHaveLength(4)
      selfTestsRunner.expect(executionOrder).toContain('Sync test')
      selfTestsRunner.expect(executionOrder).toContain('Async test')
      selfTestsRunner.expect(executionOrder).toContain('Another sync test')
      selfTestsRunner.expect(executionOrder).toContain('Quick async test')

      // Sync tests should complete first, then quick async, then longer async
      const syncTestIndex = executionOrder.indexOf('Sync test')
      const anotherSyncTestIndex = executionOrder.indexOf('Another sync test')
      const quickAsyncTestIndex = executionOrder.indexOf('Quick async test')
      const asyncTestIndex = executionOrder.indexOf('Async test')

      selfTestsRunner.expect(syncTestIndex).toBeLessThan(quickAsyncTestIndex)
      selfTestsRunner.expect(anotherSyncTestIndex).toBeLessThan(quickAsyncTestIndex)
      selfTestsRunner.expect(quickAsyncTestIndex).toBeLessThan(asyncTestIndex)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
