import { afterEachHooksFailureTest } from './after-each-hooks-failure.test'
import { afterHooksFailureTest } from './after-hooks-failure.test'
import { bailOptionTest } from './bail-option.test'
import { beforeEachHooksFailureTest } from './before-each-hooks-failure.test'
import { beforeHooksFailureTest } from './before-hooks-failure.test'
import { describeNameExtractionTest } from './describe-name-extraction.test'
import { eventsStateTest } from './events-state.test'
import { executionOrderTest } from './execution-order.test'
import { onlyOptionTest } from './only-option.test'
import { parallelOrderTest } from './parallel-order.test'
import { randomOrderTest } from './random-order.test'
import { skipOptionTest } from './skip-option.test'
import { whenItAliasesTest } from './when-it-aliases.test'

export async function testsRunnerTest() {
  await executionOrderTest()
  await eventsStateTest()
  await randomOrderTest()
  await parallelOrderTest()
  await beforeEachHooksFailureTest()
  await afterEachHooksFailureTest()
  await beforeHooksFailureTest()
  await afterHooksFailureTest()
  await onlyOptionTest()
  await skipOptionTest()
  await bailOptionTest()
  await describeNameExtractionTest()
  await whenItAliasesTest()
}
