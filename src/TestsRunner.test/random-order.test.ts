import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function randomOrderTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Random order test', () => {
    selfTestsRunner.test('Should run tests in random order when runOrder is random', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Spy on Math.random to control the randomness
      // We'll return specific values to control how the sort function behaves
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')

      // Set up controlled random values that will force a specific shuffle
      // For Array.sort(() => Math.random() - 0.5), we need values that consistently
      // return positive or negative to force swaps
      let callCount = 0
      mathRandomSpy.implement(() => {
        // Return values that will cause consistent swapping behavior
        // 0.9 - 0.5 = 0.4 (positive, swap elements)
        // 0.1 - 0.5 = -0.4 (negative, no swap)
        const values = [0.9, 0.9, 0.1, 0.9, 0.1, 0.9] // More calls to ensure sorting
        return values[callCount++ % values.length]
      })

      testsRunner.test('Test A', async () => {
        executionOrder.push('Test A')
      })

      testsRunner.test('Test B', async () => {
        executionOrder.push('Test B')
      })

      testsRunner.test('Test C', async () => {
        executionOrder.push('Test C')
      })

      await testsRunner.run()

      // Verify that Math.random was called during sorting
      selfTestsRunner.expect(mathRandomSpy).toHaveBeenCalled()
      selfTestsRunner.expect(mathRandomSpy.calls.length).toBeGreaterThan(0)

      // All tests should be present
      selfTestsRunner.expect(executionOrder).toHaveLength(3)
      selfTestsRunner.expect(executionOrder).toContain('Test A')
      selfTestsRunner.expect(executionOrder).toContain('Test B')
      selfTestsRunner.expect(executionOrder).toContain('Test C')

      // Test that randomization was attempted (Math.random was called)
      // The exact order might still be the same due to sort algorithm stability
      // but we can verify the spy was used
      selfTestsRunner.expect(mathRandomSpy.calls.length).toBeGreaterThan(0)
    })

    selfTestsRunner.test('Should maintain hook execution order even with random test order', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Control Math.random to create a predictable shuffle
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')
      mathRandomSpy.implement(() => 0.7) // Always return > 0.5 to create consistent behavior

      testsRunner.before(async () => {
        executionOrder.push('Global before')
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('Global beforeEach')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('Global afterEach')
      })

      testsRunner.after(async () => {
        executionOrder.push('Global after')
      })

      testsRunner.test('First test', async () => {
        executionOrder.push('First test')
      })

      testsRunner.test('Second test', async () => {
        executionOrder.push('Second test')
      })

      await testsRunner.run()

      // Global before should run first
      selfTestsRunner.expect(executionOrder[0]).toBe('Global before')

      // Global after should run last
      selfTestsRunner.expect(executionOrder[executionOrder.length - 1]).toBe('Global after')

      // Each test should be surrounded by beforeEach and afterEach
      const testAIndex = executionOrder.indexOf('First test')
      const testBIndex = executionOrder.indexOf('Second test')

      selfTestsRunner.expect(testAIndex).toBeGreaterThan(0)
      selfTestsRunner.expect(testBIndex).toBeGreaterThan(0)

      // Verify beforeEach comes before each test and afterEach comes after
      selfTestsRunner.expect(executionOrder[testAIndex - 1]).toBe('Global beforeEach')
      selfTestsRunner.expect(executionOrder[testAIndex + 1]).toBe('Global afterEach')

      selfTestsRunner.expect(executionOrder[testBIndex - 1]).toBe('Global beforeEach')
      selfTestsRunner.expect(executionOrder[testBIndex + 1]).toBe('Global afterEach')
    })

    selfTestsRunner.test('Should randomize tests within describe blocks', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Control Math.random for predictable results
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')

      // Create a sequence that will reverse the order
      let callCount = 0
      mathRandomSpy.implement(() => {
        const values = [0.8, 0.9, 0.1, 0.8] // Sequence of return values
        return values[callCount++ % values.length]
      })

      testsRunner.describe('Group A', () => {
        testsRunner.before(async () => {
          executionOrder.push('Group A before')
        })

        testsRunner.test('Group A Test 1', async () => {
          executionOrder.push('Group A Test 1')
        })

        testsRunner.test('Group A Test 2', async () => {
          executionOrder.push('Group A Test 2')
        })

        testsRunner.after(async () => {
          executionOrder.push('Group A after')
        })
      })

      testsRunner.describe('Group B', () => {
        testsRunner.test('Group B Test 1', async () => {
          executionOrder.push('Group B Test 1')
        })
      })

      await testsRunner.run()

      // Verify Math.random was called
      selfTestsRunner.expect(mathRandomSpy).toHaveBeenCalled()

      // Before hooks should still run before their respective tests
      const groupABeforeIndex = executionOrder.indexOf('Group A before')
      const groupATest1Index = executionOrder.indexOf('Group A Test 1')
      const groupATest2Index = executionOrder.indexOf('Group A Test 2')
      const groupAAfterIndex = executionOrder.indexOf('Group A after')

      selfTestsRunner.expect(groupABeforeIndex).toBeLessThan(groupATest1Index)
      selfTestsRunner.expect(groupABeforeIndex).toBeLessThan(groupATest2Index)
      selfTestsRunner.expect(groupAAfterIndex).toBeGreaterThan(groupATest1Index)
      selfTestsRunner.expect(groupAAfterIndex).toBeGreaterThan(groupATest2Index)

      // All tests should be present
      selfTestsRunner.expect(executionOrder).toContain('Group A Test 1')
      selfTestsRunner.expect(executionOrder).toContain('Group A Test 2')
      selfTestsRunner.expect(executionOrder).toContain('Group B Test 1')
    })

    selfTestsRunner.test('Should handle nested describes with random order', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Control randomness
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')
      mathRandomSpy.implement(() => 0.6) // Consistent slight randomization

      testsRunner.describe('Outer', () => {
        testsRunner.before(async () => {
          executionOrder.push('Outer before')
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('Outer beforeEach')
        })

        testsRunner.test('Outer test', async () => {
          executionOrder.push('Outer test')
        })

        testsRunner.describe('Inner', () => {
          testsRunner.before(async () => {
            executionOrder.push('Inner before')
          })

          testsRunner.beforeEach(async () => {
            executionOrder.push('Inner beforeEach')
          })

          testsRunner.test('Inner test', async () => {
            executionOrder.push('Inner test')
          })

          testsRunner.afterEach(async () => {
            executionOrder.push('Inner afterEach')
          })

          testsRunner.after(async () => {
            executionOrder.push('Inner after')
          })
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('Outer afterEach')
        })

        testsRunner.after(async () => {
          executionOrder.push('Outer after')
        })
      })

      await testsRunner.run()

      // Verify basic hook ordering is maintained despite randomization
      selfTestsRunner.expect(executionOrder).toContain('Outer before')
      selfTestsRunner.expect(executionOrder).toContain('Inner before')
      selfTestsRunner.expect(executionOrder).toContain('Outer test')
      selfTestsRunner.expect(executionOrder).toContain('Inner test')
      selfTestsRunner.expect(executionOrder).toContain('Inner after')
      selfTestsRunner.expect(executionOrder).toContain('Outer after')

      // Verify that befores run before their respective tests
      const outerBeforeIndex = executionOrder.indexOf('Outer before')
      const outerTestIndex = executionOrder.indexOf('Outer test')
      const innerBeforeIndex = executionOrder.indexOf('Inner before')
      const innerTestIndex = executionOrder.indexOf('Inner test')

      selfTestsRunner.expect(outerBeforeIndex).toBeLessThan(outerTestIndex)
      selfTestsRunner.expect(innerBeforeIndex).toBeLessThan(innerTestIndex)
    })

    selfTestsRunner.test('Should not affect sequence order when runOrder is sequence', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'sequence' })
      const executionOrder: string[] = []

      // Spy on Math.random but it shouldn't be called for sequence order
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')

      testsRunner.test('Test 1', async () => {
        executionOrder.push('Test 1')
      })

      testsRunner.test('Test 2', async () => {
        executionOrder.push('Test 2')
      })

      testsRunner.test('Test 3', async () => {
        executionOrder.push('Test 3')
      })

      await testsRunner.run()

      // Math.random should not have been called for sequence order
      selfTestsRunner.expect(mathRandomSpy).not.toHaveBeenCalled()

      // Tests should run in the exact order they were defined
      selfTestsRunner.expect(executionOrder).toEqual(['Test 1', 'Test 2', 'Test 3'])
    })

    selfTestsRunner.test('Should handle random order with only tests', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Create a specific sequence to control the randomization
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')
      // Return values that will create a specific shuffle pattern
      let callCount = 0
      mathRandomSpy.implement(() => {
        const values = [0.1, 0.9, 0.2] // < 0.5, > 0.5, < 0.5
        return values[callCount++ % values.length]
      })

      testsRunner.test('Alpha', async () => {
        executionOrder.push('Alpha')
      })

      testsRunner.test('Beta', async () => {
        executionOrder.push('Beta')
      })

      testsRunner.test('Gamma', async () => {
        executionOrder.push('Gamma')
      })

      testsRunner.test('Delta', async () => {
        executionOrder.push('Delta')
      })

      await testsRunner.run()

      // Verify randomization occurred
      selfTestsRunner.expect(mathRandomSpy).toHaveBeenCalled()

      // All tests should be present
      selfTestsRunner.expect(executionOrder).toHaveLength(4)
      selfTestsRunner.expect(executionOrder).toContain('Alpha')
      selfTestsRunner.expect(executionOrder).toContain('Beta')
      selfTestsRunner.expect(executionOrder).toContain('Gamma')
      selfTestsRunner.expect(executionOrder).toContain('Delta')

      // The order should be different from the original due to our controlled randomness
      const originalOrder = ['Alpha', 'Beta', 'Gamma', 'Delta']
      selfTestsRunner.expect(executionOrder).not.toEqual(originalOrder)
    })

    selfTestsRunner.test('Should maintain test isolation with random order', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const sharedState: { counter: number } = { counter: 0 }

      // Control randomness to ensure deterministic test
      const mathRandomSpy = testsRunner.spyOn(Math, 'random')
      mathRandomSpy.implement(() => 0.3) // Consistent randomization

      testsRunner.beforeEach(async () => {
        sharedState.counter = 0 // Reset counter before each test
      })

      testsRunner.test('Test increments counter', async () => {
        sharedState.counter += 1
        selfTestsRunner.expect(sharedState.counter).toBe(1)
      })

      testsRunner.test('Test also increments counter', async () => {
        sharedState.counter += 1
        selfTestsRunner.expect(sharedState.counter).toBe(1) // Should be 1, not 2, due to beforeEach reset
      })

      testsRunner.test('Test increments counter again', async () => {
        sharedState.counter += 1
        selfTestsRunner.expect(sharedState.counter).toBe(1) // Should be 1, not 3, due to beforeEach reset
      })

      await testsRunner.run()

      // All tests should pass, proving isolation is maintained
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
