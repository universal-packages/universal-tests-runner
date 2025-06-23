import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function onlyOptionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Only option test', () => {
    selfTestsRunner.test('Should run only tests marked with only option', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test('Regular test 1', async () => {
        executionOrder.push('Regular test 1')
      })

      testsRunner.test(
        'Only test',
        async () => {
          executionOrder.push('Only test')
        },
        { only: true }
      )

      testsRunner.test('Regular test 2', async () => {
        executionOrder.push('Regular test 2')
      })

      testsRunner.test(
        'Another only test',
        async () => {
          executionOrder.push('Another only test')
        },
        { only: true }
      )

      await testsRunner.run()

      // Only the tests marked with only: true should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only test', 'Another only test'])

      // Check test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(4)

      // Only tests should succeed
      const onlyTest1 = testStates.find((t) => t.name === 'Only test')
      const onlyTest2 = testStates.find((t) => t.name === 'Another only test')
      selfTestsRunner.expect(onlyTest1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(onlyTest2?.status).toBe(TestStatus.Succeeded)

      // Regular tests should be skipped
      const regularTest1 = testStates.find((t) => t.name === 'Regular test 1')
      const regularTest2 = testStates.find((t) => t.name === 'Regular test 2')
      selfTestsRunner.expect(regularTest1?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(regularTest2?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(regularTest1?.skipReason).toBe('"only" tests are running')
      selfTestsRunner.expect(regularTest2?.skipReason).toBe('"only" tests are running')
    })

    selfTestsRunner.test('Should handle only option in describe blocks', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Regular describe test', async () => {
          executionOrder.push('Regular describe test')
        })
      })

      testsRunner.describe(
        'Only describe',
        () => {
          testsRunner.test('Only describe test 1', async () => {
            executionOrder.push('Only describe test 1')
          })

          testsRunner.test('Only describe test 2', async () => {
            executionOrder.push('Only describe test 2')
          })
        },
        { only: true }
      )

      testsRunner.test('Global test', async () => {
        executionOrder.push('Global test')
      })

      await testsRunner.run()

      // Only tests in the describe block marked with only: true should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only describe test 1', 'Only describe test 2'])

      // Check test states
      const testStates = testsRunner.state.tests
      selfTestsRunner.expect(testStates).toHaveLength(4)

      // Tests in only describe should succeed
      const onlyTest1 = testStates.find((t) => t.name === 'Only describe test 1')
      const onlyTest2 = testStates.find((t) => t.name === 'Only describe test 2')
      selfTestsRunner.expect(onlyTest1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(onlyTest2?.status).toBe(TestStatus.Succeeded)

      // Tests not in only describe should be skipped
      const regularTest = testStates.find((t) => t.name === 'Regular describe test')
      const globalTest = testStates.find((t) => t.name === 'Global test')
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(globalTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle mixed only tests and only describes', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test(
        'Only test at global level',
        async () => {
          executionOrder.push('Only test at global level')
        },
        { only: true }
      )

      testsRunner.describe(
        'Only describe',
        () => {
          testsRunner.test('Test in only describe', async () => {
            executionOrder.push('Test in only describe')
          })
        },
        { only: true }
      )

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Test in regular describe', async () => {
          executionOrder.push('Test in regular describe')
        })

        testsRunner.test(
          'Only test in regular describe',
          async () => {
            executionOrder.push('Only test in regular describe')
          },
          { only: true }
        )
      })

      testsRunner.test('Regular test at global level', async () => {
        executionOrder.push('Regular test at global level')
      })

      await testsRunner.run()

      // Should run: only test at global level, test in only describe, and only test in regular describe
      selfTestsRunner.expect(executionOrder).toEqual(['Only test at global level', 'Test in only describe', 'Only test in regular describe'])
    })

    selfTestsRunner.test('Should handle nested describes with only option', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Outer describe', () => {
        testsRunner.test('Outer test', async () => {
          executionOrder.push('Outer test')
        })

        testsRunner.describe(
          'Inner describe',
          () => {
            testsRunner.test('Inner test', async () => {
              executionOrder.push('Inner test')
            })
          },
          { only: true }
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

      // Only the test in the inner describe marked with only: true should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Inner test'])

      // Check that only the inner test succeeded
      const testStates = testsRunner.state.tests
      const innerTest = testStates.find((t) => t.name === 'Inner test')
      selfTestsRunner.expect(innerTest?.status).toBe(TestStatus.Succeeded)

      // All other tests should be skipped
      const otherTests = testStates.filter((t) => t.name !== 'Inner test')
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Skipped)
      }
    })

    selfTestsRunner.test('Should handle only option with hooks', async () => {
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
        'Only describe with hooks',
        () => {
          testsRunner.before(async () => {
            executionOrder.push('Describe before')
          })

          testsRunner.beforeEach(async () => {
            executionOrder.push('Describe beforeEach')
          })

          testsRunner.test('Only test', async () => {
            executionOrder.push('Only test')
          })

          testsRunner.afterEach(async () => {
            executionOrder.push('Describe afterEach')
          })

          testsRunner.after(async () => {
            executionOrder.push('Describe after')
          })
        },
        { only: true }
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

      // Should run hooks for only the "only" describe block
      selfTestsRunner
        .expect(executionOrder)
        .toEqual([
          'Global before',
          'Describe before',
          'Global beforeEach',
          'Describe beforeEach',
          'Only test',
          'Describe afterEach',
          'Global afterEach',
          'Describe after',
          'Global after'
        ])
    })

    selfTestsRunner.test('Should handle only test within regular describe', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe('Regular describe', () => {
        testsRunner.test('Regular test in describe', async () => {
          executionOrder.push('Regular test in describe')
        })

        testsRunner.test(
          'Only test in describe',
          async () => {
            executionOrder.push('Only test in describe')
          },
          { only: true }
        )

        testsRunner.test('Another regular test in describe', async () => {
          executionOrder.push('Another regular test in describe')
        })
      })

      testsRunner.test('Global regular test', async () => {
        executionOrder.push('Global regular test')
      })

      await testsRunner.run()

      // Only the test marked with only: true should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only test in describe'])

      // Verify test states
      const testStates = testsRunner.state.tests
      const onlyTest = testStates.find((t) => t.name === 'Only test in describe')
      selfTestsRunner.expect(onlyTest?.status).toBe(TestStatus.Succeeded)

      // All other tests should be skipped
      const otherTests = testStates.filter((t) => t.name !== 'Only test in describe')
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Skipped)
        selfTestsRunner.expect(test.skipReason).toBe('"only" tests are running')
      }
    })

    selfTestsRunner.test('Should handle timeout option inheritance with only', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.describe(
        'Describe with timeout',
        () => {
          testsRunner.test(
            'Only test with inherited timeout',
            async () => {
              executionOrder.push('Only test with inherited timeout')
            },
            { only: true }
          )

          testsRunner.test('Regular test', async () => {
            executionOrder.push('Regular test')
          })
        },
        { timeout: 1000 }
      )

      await testsRunner.run()

      // Only the test marked with only: true should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only test with inherited timeout'])

      // Check that the only test inherited the timeout from describe
      const testStates = testsRunner.state.tests
      const onlyTest = testStates.find((t) => t.name === 'Only test with inherited timeout')
      selfTestsRunner.expect(onlyTest?.status).toBe(TestStatus.Succeeded)
    })

    selfTestsRunner.test('Should handle skip option with only option', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test(
        'Only test 1',
        async () => {
          executionOrder.push('Only test 1')
        },
        { only: true }
      )

      testsRunner.test(
        'Only test 2 (skipped)',
        async () => {
          executionOrder.push('Only test 2 (skipped)')
        },
        { only: true, skip: true }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      await testsRunner.run()

      // Only the non-skipped "only" test should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Only test 1'])

      const testStates = testsRunner.state.tests

      // Only test 1 should succeed
      const onlyTest1 = testStates.find((t) => t.name === 'Only test 1')
      selfTestsRunner.expect(onlyTest1?.status).toBe(TestStatus.Succeeded)

      // Only test 2 should be skipped (skip takes precedence)
      const onlyTest2 = testStates.find((t) => t.name === 'Only test 2 (skipped)')
      selfTestsRunner.expect(onlyTest2?.status).toBe(TestStatus.Skipped)

      // Regular test should be skipped due to only tests being present
      const regularTest = testStates.find((t) => t.name === 'Regular test')
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
      selfTestsRunner.expect(regularTest?.skipReason).toBe('"only" tests are running')
    })

    selfTestsRunner.test('Should handle failing only tests', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.test(
        'Failing only test',
        async () => {
          executionOrder.push('Failing only test')
          throw new Error('Test failure')
        },
        { only: true }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      testsRunner.test(
        'Passing only test',
        async () => {
          executionOrder.push('Passing only test')
        },
        { only: true }
      )

      await testsRunner.run()

      // Both only tests should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Failing only test', 'Passing only test'])

      // Runner should fail overall due to the failing test
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(false)
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)

      const testStates = testsRunner.state.tests

      // Check individual test states
      const failingTest = testStates.find((t) => t.name === 'Failing only test')
      const passingTest = testStates.find((t) => t.name === 'Passing only test')
      const regularTest = testStates.find((t) => t.name === 'Regular test')

      selfTestsRunner.expect(failingTest?.status).toBe(TestStatus.Failed)
      selfTestsRunner.expect(passingTest?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle only option with parallel execution', async () => {
      const testsRunner = new TestsRunner({ runOrder: 'parallel' })
      const executionOrder: string[] = []

      testsRunner.test(
        'Only test 1 (50ms)',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 50))
          executionOrder.push('Only test 1')
        },
        { only: true }
      )

      testsRunner.test('Regular test', async () => {
        executionOrder.push('Regular test')
      })

      testsRunner.test(
        'Only test 2 (25ms)',
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 25))
          executionOrder.push('Only test 2')
        },
        { only: true }
      )

      await testsRunner.run()

      // Only tests should execute in parallel (shorter one first)
      selfTestsRunner.expect(executionOrder).toEqual(['Only test 2', 'Only test 1'])

      const testStates = testsRunner.state.tests
      const onlyTest1 = testStates.find((t) => t.name === 'Only test 1 (50ms)')
      const onlyTest2 = testStates.find((t) => t.name === 'Only test 2 (25ms)')
      const regularTest = testStates.find((t) => t.name === 'Regular test')

      selfTestsRunner.expect(onlyTest1?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(onlyTest2?.status).toBe(TestStatus.Succeeded)
      selfTestsRunner.expect(regularTest?.status).toBe(TestStatus.Skipped)
    })

    selfTestsRunner.test('Should handle deeply nested only describes', async () => {
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
            'Level 3 (only)',
            () => {
              testsRunner.test('Level 3 test 1', async () => {
                executionOrder.push('Level 3 test 1')
              })

              testsRunner.test('Level 3 test 2', async () => {
                executionOrder.push('Level 3 test 2')
              })
            },
            { only: true }
          )

          testsRunner.describe('Level 3 regular', () => {
            testsRunner.test('Level 3 regular test', async () => {
              executionOrder.push('Level 3 regular test')
            })
          })
        })
      })

      await testsRunner.run()

      // Only tests in the deeply nested "only" describe should execute
      selfTestsRunner.expect(executionOrder).toEqual(['Level 3 test 1', 'Level 3 test 2'])

      const testStates = testsRunner.state.tests
      const level3Tests = testStates.filter((t) => t.name.startsWith('Level 3 test'))
      for (const test of level3Tests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Succeeded)
      }

      const otherTests = testStates.filter((t) => !t.name.startsWith('Level 3 test'))
      for (const test of otherTests) {
        selfTestsRunner.expect(test.status).toBe(TestStatus.Skipped)
      }
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
