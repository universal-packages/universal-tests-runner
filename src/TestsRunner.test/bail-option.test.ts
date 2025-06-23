import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function bailOptionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Bail option test', () => {
    selfTestsRunner.test('Should stop execution after first failure when bail is enabled', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Passing test 1', async () => {
        executionOrder.push('Passing test 1')
      })

      testsRunner.test('Failing test', async () => {
        executionOrder.push('Failing test')
        throw new Error('Test failure')
      })

      testsRunner.test('Test after failure', async () => {
        executionOrder.push('Test after failure')
      })

      testsRunner.test('Another test after failure', async () => {
        executionOrder.push('Another test after failure')
      })

      await testsRunner.run()

      // Should execute only up to the first failure
      selfTestsRunner.expect(executionOrder).toEqual(['Passing test 1', 'Failing test'])

      // Check test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(4)

      // First test should succeed
      const passingTest = testStates.find((t) => t.name === 'Passing test 1')
      selfTestsRunner.expect(passingTest?.status).toBe(TestStatus.Succeeded)

      // Second test should fail
      const failingTest = testStates.find((t) => t.name === 'Failing test')
      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)

      // Remaining tests should be skipped with bail reason
      const skippedTest1 = testStates.find((t) => t.name === 'Test after failure')
      const skippedTest2 = testStates.find((t) => t.name === 'Another test after failure')
      selfTestsRunner.expect(skippedTest1?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest2?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest1?.skipReason).toBe('Bail, skipped after first failure')
      selfTestsRunner.expect(skippedTest2?.skipReason).toBe('Bail, skipped after first failure')

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should bail on first failure even with multiple failures', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Passing test', async () => {
        executionOrder.push('Passing test')
      })

      testsRunner.test('First failing test', async () => {
        executionOrder.push('First failing test')
        throw new Error('First failure')
      })

      testsRunner.test('Second failing test', async () => {
        executionOrder.push('Second failing test')
        throw new Error('Second failure')
      })

      testsRunner.test('Passing test after failures', async () => {
        executionOrder.push('Passing test after failures')
      })

      await testsRunner.run()

      // Should stop after first failure
      selfTestsRunner.expect(executionOrder).toEqual(['Passing test', 'First failing test'])

      const testStates = testsRunner.state.tests
      const firstFailingTest = testStates.find((t) => t.name === 'First failing test')
      const secondFailingTest = testStates.find((t) => t.name === 'Second failing test')
      const passingTestAfter = testStates.find((t) => t.name === 'Passing test after failures')

      selfTestsRunner.expect(firstFailingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(secondFailingTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(passingTestAfter?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle bail with beforeEach hook failures', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.beforeEach(async () => {
        executionOrder.push('beforeEach')
        throw new Error('beforeEach failure')
      })

      testsRunner.test('Test 1', async () => {
        executionOrder.push('Test 1')
      })

      testsRunner.test('Test 2', async () => {
        executionOrder.push('Test 2')
      })

      await testsRunner.run()

      // Should stop after first beforeEach failure
      selfTestsRunner.expect(executionOrder).toEqual(['beforeEach'])

      const testStates = testsRunner.state.tests
      const test1 = testStates.find((t) => t.name === 'Test 1')
      const test2 = testStates.find((t) => t.name === 'Test 2')

      selfTestsRunner.expect(test1?.status).toBe(TestStatus.Error)
      selfTestsRunner.expect(test2?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(test2?.skipReason).toBe('Bail, skipped after first failure')
    })

    selfTestsRunner.test('Should handle bail with before hook failures', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.before(async () => {
        executionOrder.push('before')
        throw new Error('before failure')
      })

      testsRunner.test('Test 1', async () => {
        executionOrder.push('Test 1')
      })

      testsRunner.test('Test 2', async () => {
        executionOrder.push('Test 2')
      })

      await testsRunner.run()

      // Should stop execution after before hook failure (before hooks do cause bail)
      selfTestsRunner.expect(executionOrder).toEqual(['before', 'Test 1'])

      const testStates = testsRunner.state.tests
      const test1 = testStates.find((t) => t.name === 'Test 1')
      const test2 = testStates.find((t) => t.name === 'Test 2')

      // First test should succeed but second should be skipped due to bail
      selfTestsRunner.expect(test1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(test2?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(test2?.skipReason).toBe('Bail, skipped after first failure')
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle bail with describe blocks', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.describe('First describe', () => {
        testsRunner.test('Test 1', async () => {
          executionOrder.push('Test 1')
        })

        testsRunner.test('Failing test', async () => {
          executionOrder.push('Failing test')
          throw new Error('Test failure')
        })

        testsRunner.test('Test after failure', async () => {
          executionOrder.push('Test after failure')
        })
      })

      testsRunner.describe('Second describe', () => {
        testsRunner.test('Test in second describe', async () => {
          executionOrder.push('Test in second describe')
        })
      })

      testsRunner.test('Global test', async () => {
        executionOrder.push('Global test')
      })

      await testsRunner.run()

      // Should stop after first failure
      selfTestsRunner.expect(executionOrder).toEqual(['Test 1', 'Failing test'])

      const testStates = testsRunner.state.tests
      const failingTest = testStates.find((t) => t.name === 'Failing test')
      const testAfterFailure = testStates.find((t) => t.name === 'Test after failure')
      const testInSecondDescribe = testStates.find((t) => t.name === 'Test in second describe')
      const globalTest = testStates.find((t) => t.name === 'Global test')

      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testAfterFailure?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(testInSecondDescribe?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(globalTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle bail with nested describe blocks', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.describe('Outer describe', () => {
        testsRunner.test('Outer test 1', async () => {
          executionOrder.push('Outer test 1')
        })

        testsRunner.describe('Inner describe', () => {
          testsRunner.test('Inner test 1', async () => {
            executionOrder.push('Inner test 1')
          })

          testsRunner.test('Inner failing test', async () => {
            executionOrder.push('Inner failing test')
            throw new Error('Inner failure')
          })

          testsRunner.test('Inner test 2', async () => {
            executionOrder.push('Inner test 2')
          })
        })

        testsRunner.test('Outer test 2', async () => {
          executionOrder.push('Outer test 2')
        })
      })

      await testsRunner.run()

      // Should stop after first failure in nested structure
      selfTestsRunner.expect(executionOrder).toEqual(['Outer test 1', 'Inner test 1', 'Inner failing test'])

      const testStates = testsRunner.state.tests
      const innerFailingTest = testStates.find((t) => t.name === 'Inner failing test')
      const innerTest2 = testStates.find((t) => t.name === 'Inner test 2')
      const outerTest2 = testStates.find((t) => t.name === 'Outer test 2')

      selfTestsRunner.expect(innerFailingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(innerTest2?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(outerTest2?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle bail with hooks in describe blocks', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.before(async () => {
        executionOrder.push('Global before')
      })

      testsRunner.describe('First describe', () => {
        testsRunner.before(async () => {
          executionOrder.push('First describe before')
        })

        testsRunner.test('Test 1', async () => {
          executionOrder.push('Test 1')
        })

        testsRunner.test('Failing test', async () => {
          executionOrder.push('Failing test')
          throw new Error('Test failure')
        })

        testsRunner.after(async () => {
          executionOrder.push('First describe after')
        })
      })

      testsRunner.describe('Second describe', () => {
        testsRunner.before(async () => {
          executionOrder.push('Second describe before')
        })

        testsRunner.test('Test in second describe', async () => {
          executionOrder.push('Test in second describe')
        })

        testsRunner.after(async () => {
          executionOrder.push('Second describe after')
        })
      })

      testsRunner.after(async () => {
        executionOrder.push('Global after')
      })

      await testsRunner.run()

      // Should run hooks for completed describes but not for skipped ones
      selfTestsRunner.expect(executionOrder).toEqual(['Global before', 'First describe before', 'Test 1', 'Failing test', 'First describe after'])

      const testStates = testsRunner.state.tests
      const testInSecondDescribe = testStates.find((t) => t.name === 'Test in second describe')
      selfTestsRunner.expect(testInSecondDescribe?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle bail with only option', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      testsRunner.test(
        'Only passing test',
        async () => {
          executionOrder.push('Only passing test')
        },
        { only: true }
      )

      testsRunner.test(
        'Only failing test',
        async () => {
          executionOrder.push('Only failing test')
          throw new Error('Only test failure')
        },
        { only: true }
      )

      testsRunner.test(
        'Another only test',
        async () => {
          executionOrder.push('Another only test')
        },
        { only: true }
      )

      await testsRunner.run()

      // Should execute only tests and bail after first failure
      selfTestsRunner.expect(executionOrder).toEqual(['Only passing test', 'Only failing test'])

      const testStates = testsRunner.state.tests
      const regularTest = testStates.find((t) => t.name === 'Regular test')
      const onlyPassingTest = testStates.find((t) => t.name === 'Only passing test')
      const onlyFailingTest = testStates.find((t) => t.name === 'Only failing test')
      const anotherOnlyTest = testStates.find((t) => t.name === 'Another only test')

      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(regularTest?.skipReason).toBe('"only" tests are running')
      selfTestsRunner.expect(onlyPassingTest?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(onlyFailingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(anotherOnlyTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(anotherOnlyTest?.skipReason).toBe('Bail, skipped after first failure')
    })

    selfTestsRunner.test('Should handle bail with skip option', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Passing test', async () => {
        executionOrder.push('Passing test')
      })

      testsRunner.test(
        'Skipped test',
        async () => {
          executionOrder.push('Skipped test')
        },
        { skip: true }
      )

      testsRunner.test('Failing test', async () => {
        executionOrder.push('Failing test')
        throw new Error('Test failure')
      })

      testsRunner.test('Test after failure', async () => {
        executionOrder.push('Test after failure')
      })

      await testsRunner.run()

      // Should skip the skipped test and bail after first failure
      selfTestsRunner.expect(executionOrder).toEqual(['Passing test', 'Failing test'])

      const testStates = testsRunner.state.tests
      const skippedTest = testStates.find((t) => t.name === 'Skipped test')
      const failingTest = testStates.find((t) => t.name === 'Failing test')
      const testAfterFailure = testStates.find((t) => t.name === 'Test after failure')

      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testAfterFailure?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(testAfterFailure?.skipReason).toBe('Bail, skipped after first failure')
    })

    selfTestsRunner.test('Should not bail in parallel mode', async () => {
      const testsRunner = new TestsRunner({ bail: true, runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.test('Test 1 (50ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        executionOrder.push('Test 1')
      })

      testsRunner.test('Failing test (25ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 25))
        executionOrder.push('Failing test')
        throw new Error('Test failure')
      })

      testsRunner.test('Test 2 (10ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        executionOrder.push('Test 2')
      })

      await testsRunner.run()

      // In parallel mode, all tests should execute regardless of bail option
      selfTestsRunner.expect(executionOrder).toEqual(['Test 2', 'Failing test', 'Test 1'])

      const testStates = testsRunner.state.tests
      const test1 = testStates.find((t) => t.name === 'Test 1 (50ms)')
      const failingTest = testStates.find((t) => t.name === 'Failing test (25ms)')
      const test2 = testStates.find((t) => t.name === 'Test 2 (10ms)')

      selfTestsRunner.expect(test1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(test2?.status).toBe(TestStatus.Succeeded)

      // Runner should fail overall
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle bail with random execution', async () => {
      const testsRunner = new TestsRunner({ bail: true, runOrder: 'random' })
      const executionOrder: string[] = []

      // Mock Math.random to have predictable results
      testsRunner.spyOn(Math, 'random').implement(() => 0.5)

      testsRunner.test('Test A', async () => {
        executionOrder.push('Test A')
      })

      testsRunner.test('Failing test', async () => {
        executionOrder.push('Failing test')
        throw new Error('Test failure')
      })

      testsRunner.test('Test B', async () => {
        executionOrder.push('Test B')
      })

      await testsRunner.run()

      // Should execute tests in random order but bail after first failure
      // The exact order depends on randomization, but we know it should stop after first failure
      selfTestsRunner.expect(executionOrder).toHaveLength(2) // Should execute 2 tests before bailing
      selfTestsRunner.expect(executionOrder).toContain('Failing test')

      const testStates = testsRunner.state.tests
      const failingTest = testStates.find((t) => t.name === 'Failing test')
      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)

      // At least one test should be skipped with bail reason
      const skippedTests = testStates.filter((t) => t.status === TestStatus.Skipped)
      selfTestsRunner.expect(skippedTests.length).toBeGreaterThan(0)
      for (const test of skippedTests) {
        selfTestsRunner.expect(test.skipReason).toBe('Bail, skipped after first failure')
      }
    })

    selfTestsRunner.test('Should handle bail when all tests pass', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Passing test 1', async () => {
        executionOrder.push('Passing test 1')
      })

      testsRunner.test('Passing test 2', async () => {
        executionOrder.push('Passing test 2')
      })

      testsRunner.test('Passing test 3', async () => {
        executionOrder.push('Passing test 3')
      })

      await testsRunner.run()

      // Should execute all tests when no failures occur
      selfTestsRunner.expect(executionOrder).toEqual(['Passing test 1', 'Passing test 2', 'Passing test 3'])

      const testStates = testsRunner.state.tests
      for (const test of testStates) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Succeeded)
      }

      // Runner should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(false)
    })

    selfTestsRunner.test('Should handle bail with async test failures', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Async passing test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        executionOrder.push('Async passing test')
      })

      testsRunner.test('Async failing test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        executionOrder.push('Async failing test')
        throw new Error('Async test failure')
      })

      testsRunner.test('Test after async failure', async () => {
        executionOrder.push('Test after async failure')
      })

      await testsRunner.run()

      // Should bail after async failure
      selfTestsRunner.expect(executionOrder).toEqual(['Async passing test', 'Async failing test'])

      const testStates = testsRunner.state.tests
      const asyncFailingTest = testStates.find((t) => t.name === 'Async failing test')
      const testAfterFailure = testStates.find((t) => t.name === 'Test after async failure')

      selfTestsRunner.expect(asyncFailingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testAfterFailure?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(testAfterFailure?.skipReason).toBe('Bail, skipped after first failure')
    })

    selfTestsRunner.test('Should handle bail with error failures', async () => {
      const testsRunner = new TestsRunner({ bail: true })
      const executionOrder: string[] = []

      testsRunner.test('Passing test', async () => {
        executionOrder.push('Passing test')
      })

      testsRunner.test('Error test', async () => {
        executionOrder.push('Error test')
        // Simulate an error condition
        const obj: any = null
        obj.property.access() // This will throw an error
      })

      testsRunner.test('Test after error', async () => {
        executionOrder.push('Test after error')
      })

      await testsRunner.run()

      // Should bail after error failure
      selfTestsRunner.expect(executionOrder).toEqual(['Passing test', 'Error test'])

      const testStates = testsRunner.state.tests
      const errorTest = testStates.find((t) => t.name === 'Error test')
      const testAfterError = testStates.find((t) => t.name === 'Test after error')

      selfTestsRunner.expect(errorTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(testAfterError?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(testAfterError?.skipReason).toBe('Bail, skipped after first failure')
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
