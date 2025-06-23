import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function executionOrderTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Execution order test', () => {
    selfTestsRunner.test('Should run the tests in the correct order', async () => {
      const testsRunner = new TestsRunner()
      const executionOrder: string[] = []

      testsRunner.before(async () => {
        executionOrder.push('GLOBAL before [1]')
      })

      testsRunner.before(async () => {
        executionOrder.push('GLOBAL before [2]')
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('GLOBAL beforeEach [1]')
      })

      testsRunner.beforeEach(async () => {
        executionOrder.push('GLOBAL beforeEach [2]')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('GLOBAL afterEach [1]')
      })

      testsRunner.afterEach(async () => {
        executionOrder.push('GLOBAL afterEach [2]')
      })

      testsRunner.after(async () => {
        executionOrder.push('GLOBAL after [1]')
      })

      testsRunner.after(async () => {
        executionOrder.push('GLOBAL after [2]')
      })

      testsRunner.test('GLOBAL test [1]', async () => {
        executionOrder.push('GLOBAL test [1]')
      })

      testsRunner.test('GLOBAL test [2]', async () => {
        executionOrder.push('GLOBAL test [2]')
      })

      testsRunner.describe('describe A', () => {
        testsRunner.before(async () => {
          executionOrder.push('describe A before [1]')
        })

        testsRunner.before(async () => {
          executionOrder.push('describe A before [2]')
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('describe A beforeEach [1]')
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('describe A beforeEach [2]')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('describe A afterEach [1]')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('describe A afterEach [2]')
        })

        testsRunner.after(async () => {
          executionOrder.push('describe A after [1]')
        })

        testsRunner.after(async () => {
          executionOrder.push('describe A after [2]')
        })

        testsRunner.test('describe A test [1]', async () => {
          executionOrder.push('describe A test [1]')
        })

        testsRunner.test('describe A test [2]', async () => {
          executionOrder.push('describe A test [2]')
        })

        testsRunner.describe('describe A > A2', () => {
          testsRunner.test('describe A > A2 test [1]', async () => {
            executionOrder.push('describe A > A2 test [1]')
          })

          testsRunner.describe('describe A > A2 > A3', () => {
            testsRunner.test('describe A > A2 > A3 test [1]', async () => {
              executionOrder.push('describe A > A2 > A3 test [1]')
            })

            testsRunner.test('describe A > A2 > A3 test [2]', async () => {
              executionOrder.push('describe A > A2 > A3 test [2]')
            })
          })

          testsRunner.test('describe A > A2 test [2]', async () => {
            executionOrder.push('describe A > A2 test [2]')
          })

          testsRunner.before(async () => {
            executionOrder.push('describe A > A2 before [1]')
          })

          testsRunner.before(async () => {
            executionOrder.push('describe A > A2 before [2]')
          })

          testsRunner.beforeEach(async () => {
            executionOrder.push('describe A > A2 beforeEach [1]')
          })

          testsRunner.beforeEach(async () => {
            executionOrder.push('describe A > A2 beforeEach [2]')
          })

          testsRunner.afterEach(async () => {
            executionOrder.push('describe A > A2 afterEach [1]')
          })

          testsRunner.afterEach(async () => {
            executionOrder.push('describe A > A2 afterEach [2]')
          })

          testsRunner.after(async () => {
            executionOrder.push('describe A > A2 after [1]')
          })

          testsRunner.after(async () => {
            executionOrder.push('describe A > A2 after [2]')
          })
        })
      })

      testsRunner.describe('describe B', () => {
        testsRunner.before(async () => {
          executionOrder.push('describe B before [1]')
        })

        testsRunner.before(async () => {
          executionOrder.push('describe B before [2]')
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('describe B beforeEach [1]')
        })

        testsRunner.beforeEach(async () => {
          executionOrder.push('describe B beforeEach [2]')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('describe B afterEach [1]')
        })

        testsRunner.afterEach(async () => {
          executionOrder.push('describe B afterEach [2]')
        })

        testsRunner.after(async () => {
          executionOrder.push('describe B after [1]')
        })

        testsRunner.after(async () => {
          executionOrder.push('describe B after [2]')
        })

        testsRunner.test('describe B test [1]', async () => {
          executionOrder.push('describe B test [1]')
        })

        testsRunner.test('describe B test [2]', async () => {
          executionOrder.push('describe B test [2]')
        })
      })

      testsRunner.describe('describe C (empty)', () => {
        // This describe block has no tests, should be marked as TestStatus.Succeeded
      })

      testsRunner.describe('describe D (empty with hooks)', () => {
        testsRunner.before(async () => {
          executionOrder.push('describe D before [1]')
        })
      })

      testsRunner.describe('describe E (nested empty)', () => {
        testsRunner.describe('describe E > E1 (empty)', () => {
          // Empty nested describe
        })
      })

      testsRunner.describe('describe F (nested empty with hooks)', () => {
        testsRunner.before(async () => {
          executionOrder.push('describe F before [1]')
        })
      })

      await testsRunner.run()

      selfTestsRunner
        .expect(executionOrder)
        .toEqual([
          'GLOBAL before [1]',
          'GLOBAL before [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'GLOBAL test [1]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'GLOBAL test [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'describe A before [1]',
          'describe A before [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A test [1]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A test [2]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'describe A > A2 before [1]',
          'describe A > A2 before [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A > A2 beforeEach [1]',
          'describe A > A2 beforeEach [2]',
          'describe A > A2 test [1]',
          'describe A > A2 afterEach [1]',
          'describe A > A2 afterEach [2]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A > A2 beforeEach [1]',
          'describe A > A2 beforeEach [2]',
          'describe A > A2 > A3 test [1]',
          'describe A > A2 afterEach [1]',
          'describe A > A2 afterEach [2]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A > A2 beforeEach [1]',
          'describe A > A2 beforeEach [2]',
          'describe A > A2 > A3 test [2]',
          'describe A > A2 afterEach [1]',
          'describe A > A2 afterEach [2]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe A beforeEach [1]',
          'describe A beforeEach [2]',
          'describe A > A2 beforeEach [1]',
          'describe A > A2 beforeEach [2]',
          'describe A > A2 test [2]',
          'describe A > A2 afterEach [1]',
          'describe A > A2 afterEach [2]',
          'describe A afterEach [1]',
          'describe A afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'describe A > A2 after [1]',
          'describe A > A2 after [2]',

          'describe A after [1]',
          'describe A after [2]',

          'describe B before [1]',
          'describe B before [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe B beforeEach [1]',
          'describe B beforeEach [2]',
          'describe B test [1]',
          'describe B afterEach [1]',
          'describe B afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'GLOBAL beforeEach [1]',
          'GLOBAL beforeEach [2]',
          'describe B beforeEach [1]',
          'describe B beforeEach [2]',
          'describe B test [2]',
          'describe B afterEach [1]',
          'describe B afterEach [2]',
          'GLOBAL afterEach [1]',
          'GLOBAL afterEach [2]',

          'describe B after [1]',
          'describe B after [2]',

          'GLOBAL after [1]',
          'GLOBAL after [2]'
        ])
    })
  })

  await selfTestsRunner.run()

  evaluateTestResults(selfTestsRunner)
}
