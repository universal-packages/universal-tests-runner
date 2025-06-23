import { TestsRunner } from '../TestsRunner'
import { TestStatus } from '../TestsRunner.types'
import { evaluateTestResults } from '../utils.test'

export async function whenItAliasesTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('When and It aliases test', () => {
    selfTestsRunner.test('Should use when as alias for describe', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.when('using when method', () => {
        testsRunner.test('should work like describe', async () => {
          testsRunner.expect(true).toBe(true)
        })
      })

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      const succeededTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Succeeded)
      const failedTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Failed)

      selfTestsRunner.expect(nodeState.name).toBe('using when method')
      selfTestsRunner.expect(succeededTests).toHaveLength(1)
      selfTestsRunner.expect(failedTests).toHaveLength(0)
    })

    selfTestsRunner.test('Should use it as alias for test', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.describe('using it method', () => {
        testsRunner.it('should work like test', async () => {
          testsRunner.expect(42).toBe(42)
        })
      })

      await testsRunner.run()

      const testState = testsRunner.state.tests[0]
      const succeededTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Succeeded)
      const failedTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Failed)

      selfTestsRunner.expect(testState.name).toBe('should work like test')
      selfTestsRunner.expect(succeededTests).toHaveLength(1)
      selfTestsRunner.expect(failedTests).toHaveLength(0)
    })

    selfTestsRunner.test('Should use both when and it together', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.when('combining when and it', () => {
        testsRunner.it('should work seamlessly together', async () => {
          const result = 2 + 2
          testsRunner.expect(result).toBe(4)
        })

        testsRunner.it('should support multiple tests', async () => {
          const greeting = 'Hello, World!'
          testsRunner.expect(greeting).toContain('World')
        })
      })

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      const succeededTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Succeeded)
      const failedTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Failed)

      selfTestsRunner.expect(nodeState.name).toBe('combining when and it')
      selfTestsRunner.expect(nodeState.tests).toHaveLength(2)
      selfTestsRunner.expect(succeededTests).toHaveLength(2)
      selfTestsRunner.expect(failedTests).toHaveLength(0)
    })

    selfTestsRunner.test('Should support nested when blocks', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.when('outer context', () => {
        testsRunner.when('inner context', () => {
          testsRunner.it('should be nested properly', async () => {
            testsRunner.expect('nested').toBe('nested')
          })
        })
      })

      await testsRunner.run()

      const outerNode = testsRunner.state.nodes.children[0]
      const innerNode = outerNode.children[0]
      const succeededTests = testsRunner.state.tests.filter((t) => t.status === TestStatus.Succeeded)

      selfTestsRunner.expect(outerNode.name).toBe('outer context')
      selfTestsRunner.expect(innerNode.name).toBe('inner context')
      selfTestsRunner.expect(innerNode.tests).toHaveLength(1)
      selfTestsRunner.expect(succeededTests).toHaveLength(1)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
