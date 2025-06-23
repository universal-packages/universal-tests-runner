import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function skipOptionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Skip option test', () => {
    selfTestsRunner.test('Should skip tests marked with skip option', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test('Regular test 1', async () => {
        executionOrder.push('Regular test 1')
      })

      testsRunner.test(
        'Skipped test',
        async () => {
          executionOrder.push('Skipped test')
        },
        { skip: true }
      )

      testsRunner.test('Regular test 2', async () => {
        executionOrder.push('Regular test 2')
      })

      testsRunner.test(
        'Another skipped test',
        async () => {
          executionOrder.push('Another skipped test')
        },
        { skip: true }
      )

      await testsRunner.run()

      // Only non-skipped tests should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test 1', 'Regular test 2'])

      // Check test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(4)

      // Regular tests should succeed
      const regularTest1 = testStates.find((t) => t.name === 'Regular test 1')
      const regularTest2 = testStates.find((t) => t.name === 'Regular test 2')
      selfTestsRunner.expect(regularTest1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(regularTest2?.status).toBe(TestStatus.Succeeded)

      // Skipped tests should be skipped
      const skippedTest1 = testStates.find((t) => t.name === 'Skipped test')
      const skippedTest2 = testStates.find((t) => t.name === 'Another skipped test')
      selfTestsRunner.expect(skippedTest1?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest2?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should skip tests with custom skip reason', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      testsRunner.test(
        'Skipped test with reason',
        async () => {
          executionOrder.push('Skipped test with reason')
        },
        { skip: true, skipReason: 'Not implemented yet' }
      )

      await testsRunner.run()

      // Only non-skipped test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test'])

      // Check skip reason
      const testStates = testsRunner.state.tests
      const skippedTest = testStates.find((t) => t.name === 'Skipped test with reason')
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest?.skipReason).toBe('Not implemented yet')
    })

    selfTestsRunner.test('Should handle skip option in describe blocks', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Regular describe test', async () => {
          executionOrder.push('Regular describe test')
        })
      })

      testsRunner.describe(
        'Skipped describe',
        () => {
          testsRunner.test('Skipped describe test 1', async () => {
            executionOrder.push('Skipped describe test 1')
          })

          testsRunner.test('Skipped describe test 2', async () => {
            executionOrder.push('Skipped describe test 2')
          })
        },
        { skip: true }
      )

      testsRunner.test('Global test', async () => {
        executionOrder.push('Global test')
      })

      await testsRunner.run()

      // Only tests not in skipped describe should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular describe test', 'Global test'])

      // Check test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(4)

      // Tests not in skipped describe should succeed
      const regularTest = testStates.find((t) => t.name === 'Regular describe test')
      const globalTest = testStates.find((t) => t.name === 'Global test')
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(globalTest?.status).toBe(TestStatus.Succeeded)

      // Tests in skipped describe should be skipped
      const skippedTest1 = testStates.find((t) => t.name === 'Skipped describe test 1')
      const skippedTest2 = testStates.find((t) => t.name === 'Skipped describe test 2')
      selfTestsRunner.expect(skippedTest1?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest2?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle describe skip with custom reason', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe(
        'Skipped describe with reason',
        () => {
          testsRunner.test('Test in skipped describe', async () => {
            executionOrder.push('Test in skipped describe')
          })
        },
        { skip: true, skipReason: 'Feature not ready' }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      await testsRunner.run()

      // Only regular test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test'])

      // Check skip reason inheritance
      const testStates = testsRunner.state.tests
      const skippedTest = testStates.find((t) => t.name === 'Test in skipped describe')
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(skippedTest?.skipReason).toBe('Feature not ready')
    })

    selfTestsRunner.test('Should handle mixed skip tests and describes', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test(
        'Skipped test at global level',
        async () => {
          executionOrder.push('Skipped test at global level')
        },
        { skip: true }
      )

      testsRunner.describe(
        'Skipped describe',
        () => {
          testsRunner.test('Test in skipped describe', async () => {
            executionOrder.push('Test in skipped describe')
          })
        },
        { skip: true }
      )

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Test in regular describe', async () => {
          executionOrder.push('Test in regular describe')
        })

        testsRunner.test(
          'Skipped test in regular describe',
          async () => {
            executionOrder.push('Skipped test in regular describe')
          },
          { skip: true }
        )
      })

      testsRunner.test('Regular test at global level', async () => {
        executionOrder.push('Regular test at global level')
      })

      await testsRunner.run()

      // Should run: test in regular describe and regular test at global level
      selfTestsRunner.expect(executionOrder).toEqual(['Test in regular describe', 'Regular test at global level'])
    })

    selfTestsRunner.test('Should handle nested describes with skip option', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Outer describe', () => {
        testsRunner.test('Outer test', async () => {
          executionOrder.push('Outer test')
        })

        testsRunner.describe(
          'Inner describe (skipped)',
          () => {
            testsRunner.test('Inner test', async () => {
              executionOrder.push('Inner test')
            })
          },
          { skip: true }
        )

        testsRunner.describe('Another inner describe', () => {
          testsRunner.test('Another inner test', async () => {
            executionOrder.push('Another inner test')
          })
        })
      })

      testsRunner.describe('Another outer describe', () => {
        testsRunner.test('Another outer test', async () => {
          executionOrder.push('Another outer test')
        })
      })

      await testsRunner.run()

      // All tests except the one in skipped inner describe should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Outer test', 'Another inner test', 'Another outer test'])

      // Check that only the inner test was skipped
      const testStates = testsRunner.state.tests
      const innerTest = testStates.find((t) => t.name === 'Inner test')
      selfTestsRunner.expect(innerTest?.status).toBe(TestStatus.Skipped)

      // All other tests should succeed
      const otherTests = testStates.filter((t) => t.name !== 'Inner test')
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Succeeded)
      }
    })

    selfTestsRunner.test('Should handle skip option with hooks', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

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

      testsRunner.describe(
        'Skipped describe with hooks',
        () => {
          testsRunner.before(async () => {
            executionOrder.push('Describe before')
          })

          testsRunner.beforeEach(async () => {
            executionOrder.push('Describe beforeEach')
          })

          testsRunner.test('Skipped test', async () => {
            executionOrder.push('Skipped test')
          })

          testsRunner.afterEach(async () => {
            executionOrder.push('Describe afterEach')
          })

          testsRunner.after(async () => {
            executionOrder.push('Describe after')
          })
        },
        { skip: true }
      )

      testsRunner.describe('Regular describe with hooks', () => {
        testsRunner.before(async () => {
          executionOrder.push('Regular before')
        })

        testsRunner.test('Regular test', async () => {
          executionOrder.push('Regular test')
        })

        testsRunner.after(async () => {
          executionOrder.push('Regular after')
        })
      })

      await testsRunner.run()

      // Should run hooks only for non-skipped describes
      selfTestsRunner.expect(executionOrder).toEqual(['Global before', 'Regular before', 'Global beforeEach', 'Regular test', 'Global afterEach', 'Regular after', 'Global after'])
    })

    selfTestsRunner.test('Should handle skip test within regular describe', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Regular test in describe', async () => {
          executionOrder.push('Regular test in describe')
        })

        testsRunner.test(
          'Skipped test in describe',
          async () => {
            executionOrder.push('Skipped test in describe')
          },
          { skip: true }
        )

        testsRunner.test('Another regular test in describe', async () => {
          executionOrder.push('Another regular test in describe')
        })
      })

      testsRunner.test('Global regular test', async () => {
        executionOrder.push('Global regular test')
      })

      await testsRunner.run()

      // All tests except the skipped one should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test in describe', 'Another regular test in describe', 'Global regular test'])

      // Verify test states
      const testStates = testsRunner.state.tests
      const skippedTest = testStates.find((t) => t.name === 'Skipped test in describe')
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)

      // All other tests should succeed
      const otherTests = testStates.filter((t) => t.name !== 'Skipped test in describe')
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Succeeded)
      }
    })

    selfTestsRunner.test('Should handle timeout option inheritance with skip', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe(
        'Describe with timeout',
        () => {
          testsRunner.test(
            'Skipped test with inherited timeout',
            async () => {
              executionOrder.push('Skipped test with inherited timeout')
            },
            { skip: true }
          )

          testsRunner.test('Regular test', async () => {
            executionOrder.push('Regular test')
          })
        },
        { timeout: 1000 }
      )

      await testsRunner.run()

      // Only the regular test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test'])

      // Check that the skipped test was properly skipped
      const testStates = testsRunner.state.tests
      const skippedTest = testStates.find((t) => t.name === 'Skipped test with inherited timeout')
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle skip and only options together (skip takes precedence)', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test(
        'Only and skipped test',
        async () => {
          executionOrder.push('Only and skipped test')
        },
        { only: true, skip: true }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      testsRunner.test(
        'Only test',
        async () => {
          executionOrder.push('Only test')
        },
        { only: true }
      )

      await testsRunner.run()

      // Only the non-skipped "only" test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only test'])

      const testStates = testsRunner.state.tests

      // Only and skipped test should be skipped (skip takes precedence)
      const onlySkippedTest = testStates.find((t) => t.name === 'Only and skipped test')
      selfTestsRunner.expect(onlySkippedTest?.status).toBe(TestStatus.Skipped)

      // Only test should succeed
      const onlyTest = testStates.find((t) => t.name === 'Only test')
      selfTestsRunner.expect(onlyTest?.status).toBe(TestStatus.Succeeded)

      // Regular test should be skipped due to only tests being present
      const regularTest = testStates.find((t) => t.name === 'Regular test')
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(regularTest?.skipReason).toBe('"only" tests are running')
    })

    selfTestsRunner.test('Should handle skip option with parallel execution', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.test('Test 1 (50ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        executionOrder.push('Test 1')
      })

      testsRunner.test(
        'Skipped test',
        async () => {
          executionOrder.push('Skipped test')
        },
        { skip: true }
      )

      testsRunner.test('Test 2 (25ms)', async () => {
        await new Promise((resolve) => setTimeout(resolve, 25))
        executionOrder.push('Test 2')
      })

      await testsRunner.run()

      // Non-skipped tests should execute in parallel (shorter one first)
      selfTestsRunner.expect(executionOrder).toEqual(['Test 2', 'Test 1'])

      const testStates = testsRunner.state.tests
      const test1 = testStates.find((t) => t.name === 'Test 1 (50ms)')
      const test2 = testStates.find((t) => t.name === 'Test 2 (25ms)')
      const skippedTest = testStates.find((t) => t.name === 'Skipped test')

      selfTestsRunner.expect(test1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(test2?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle skip option with random execution', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'random' })
      const executionOrder: string[] = []

      // Mock Math.random to have predictable results
      let callCount = 0
      testsRunner.spyOn(Math, 'random').implement(() => {
        // Return values that will cause a specific sort order
        callCount++
        return callCount % 2 === 0 ? 0.7 : 0.3
      })

      testsRunner.test('Test A', async () => {
        executionOrder.push('Test A')
      })

      testsRunner.test(
        'Skipped test',
        async () => {
          executionOrder.push('Skipped test')
        },
        { skip: true }
      )

      testsRunner.test('Test B', async () => {
        executionOrder.push('Test B')
      })

      await testsRunner.run()

      // Non-skipped tests should execute (order may vary due to randomization)
      // Just check that both non-skipped tests ran and skipped test didn't
      selfTestsRunner.expect(executionOrder).toHaveLength(2)
      selfTestsRunner.expect(executionOrder).toContain('Test A')
      selfTestsRunner.expect(executionOrder).toContain('Test B')
      selfTestsRunner.expect(executionOrder).not.toContain('Skipped test')

      const testStates = testsRunner.state.tests
      const testA = testStates.find((t) => t.name === 'Test A')
      const testB = testStates.find((t) => t.name === 'Test B')
      const skippedTest = testStates.find((t) => t.name === 'Skipped test')

      selfTestsRunner.expect(testA?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(testB?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(skippedTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle deeply nested skip describes', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Level 1', () => {
        testsRunner.test('Level 1 test', async () => {
          executionOrder.push('Level 1 test')
        })

        testsRunner.describe('Level 2', () => {
          testsRunner.test('Level 2 test', async () => {
            executionOrder.push('Level 2 test')
          })

          testsRunner.describe(
            'Level 3 (skipped)',
            () => {
              testsRunner.test('Level 3 test 1', async () => {
                executionOrder.push('Level 3 test 1')
              })

              testsRunner.test('Level 3 test 2', async () => {
                executionOrder.push('Level 3 test 2')
              })
            },
            { skip: true }
          )

          testsRunner.describe('Level 3 regular', () => {
            testsRunner.test('Level 3 regular test', async () => {
              executionOrder.push('Level 3 regular test')
            })
          })
        })
      })

      await testsRunner.run()

      // All tests except those in the skipped describe should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Level 1 test', 'Level 2 test', 'Level 3 regular test'])

      const testStates = testsRunner.state.tests
      const level3SkippedTests = testStates.filter((t) => t.name.startsWith('Level 3 test'))
      for (const test of level3SkippedTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Skipped)
      }

      const otherTests = testStates.filter((t) => !t.name.startsWith('Level 3 test'))
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Succeeded)
      }
    })

    selfTestsRunner.test('Should handle skip reason inheritance in nested describes', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe(
        'Outer skipped describe',
        () => {
          testsRunner.describe('Inner describe', () => {
            testsRunner.test('Nested test', async () => {
              executionOrder.push('Nested test')
            })
          })

          testsRunner.test('Outer test', async () => {
            executionOrder.push('Outer test')
          })
        },
        { skip: true, skipReason: 'Entire feature disabled' }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      await testsRunner.run()

      // Only regular test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test'])

      // Check skip reason inheritance
      const testStates = testsRunner.state.tests
      const nestedTest = testStates.find((t) => t.name === 'Nested test')
      const outerTest = testStates.find((t) => t.name === 'Outer test')

      selfTestsRunner.expect(nestedTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(nestedTest?.skipReason).toBe('Entire feature disabled')
      selfTestsRunner.expect(outerTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(outerTest?.skipReason).toBe('Entire feature disabled')
    })

    selfTestsRunner.test('Should handle empty skipped describes', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe(
        'Empty skipped describe',
        () => {
          // No tests in this describe
        },
        { skip: true }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      await testsRunner.run()

      // Only regular test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Regular test'])

      // Runner should succeed
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(false)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
