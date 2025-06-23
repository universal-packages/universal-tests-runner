import { assertionTest } from './Assertion.test/index.test'
import { testsRunnerTest } from './TestsRunner.test/index.test'
import { asymmetricAssertionsTest } from './asymmetric-assertions/index.test'
import { createMockFunctionTest } from './createMockFunction.test'
import { diffTest } from './diff.test'
import { spyOnTest } from './spyOn.test'

async function runAllTests() {
  await testsRunnerTest()
  await assertionTest()
  await asymmetricAssertionsTest()
  await diffTest()
  await createMockFunctionTest()
  await spyOnTest()
}

runAllTests()
