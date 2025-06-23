import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function describeNameExtractionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('Describe name extraction test', () => {
    selfTestsRunner.test('Should handle string describe names', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.describe('String describe name', () => {
        testsRunner.test('Test in string describe', async () => {
          // Test content
        })
      })

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      selfTestsRunner.expect(nodeState.name).toBe('String describe name')
    })

    selfTestsRunner.test('Should extract named function names for describe', async () => {
      const testsRunner = new TestsRunner()

      function MyNamedFunction() {
        testsRunner.test('Test in named function describe', async () => {
          // Test content
        })
      }

      testsRunner.describe(MyNamedFunction, MyNamedFunction)

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      selfTestsRunner.expect(nodeState.name).toBe('MyNamedFunction')
    })

    selfTestsRunner.test('Should extract class names for describe', async () => {
      const testsRunner = new TestsRunner()

      class MyTestClass {
        static testMethod() {
          testsRunner.test('Test in class describe', async () => {
            // Test content
          })
        }
      }

      testsRunner.describe(MyTestClass, () => {
        MyTestClass.testMethod()
      })

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      selfTestsRunner.expect(nodeState.name).toBe('MyTestClass')
    })

    selfTestsRunner.test('Should handle anonymous functions with variable names', async () => {
      const testsRunner = new TestsRunner()

      const anonymousFunction = function () {
        testsRunner.test('Test in anonymous function describe', async () => {
          // Test content
        })
      }

      testsRunner.describe(anonymousFunction, anonymousFunction)

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      // When assigned to a variable, the function gets the variable name
      selfTestsRunner.expect(nodeState.name).toBe('anonymousFunction')
    })

    selfTestsRunner.test('Should handle arrow functions with variable names', async () => {
      const testsRunner = new TestsRunner()

      const arrowFunction = () => {
        testsRunner.test('Test in arrow function describe', async () => {
          // Test content
        })
      }

      testsRunner.describe(arrowFunction, arrowFunction)

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      // Arrow functions assigned to variables get the variable name
      selfTestsRunner.expect(nodeState.name).toBe('arrowFunction')
    })

    selfTestsRunner.test('Should handle truly anonymous functions with fallback name', async () => {
      const testsRunner = new TestsRunner()

      // Create a truly anonymous function by using a function expression without assignment
      const anonymousFunc = (function () {
        return function () {
          testsRunner.test('Test in truly anonymous function describe', async () => {
            // Test content
          })
        }
      })()

      testsRunner.describe(anonymousFunc, anonymousFunc)

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      // Truly anonymous functions should get the fallback name
      selfTestsRunner.expect(nodeState.name).toBe('Anonymous Function')
    })

    selfTestsRunner.test('Should handle built-in constructor functions', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.describe(Array, () => {
        testsRunner.test('Test for Array constructor', async () => {
          // Test content
        })
      })

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      selfTestsRunner.expect(nodeState.name).toBe('Array')
    })

    selfTestsRunner.test('Should handle functions with complex names', async () => {
      const testsRunner = new TestsRunner()

      function $specialCharacters_123() {
        testsRunner.test('Test with special chars', async () => {
          // Test content
        })
      }

      testsRunner.describe($specialCharacters_123, $specialCharacters_123)

      await testsRunner.run()

      const nodeState = testsRunner.state.nodes.children[0]
      selfTestsRunner.expect(nodeState.name).toBe('$specialCharacters_123')
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
