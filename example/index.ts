import { runBasicTestsExample } from './01-basic-tests'
import { runTestLifecycleExample } from './02-test-lifecycle'
import { runMatchersExample } from './03-matchers'
import { runMockFunctionsExample } from './04-mock-functions'
import { runAsymmetricAssertionsExample } from './05-asymmetric-assertions'
import { runEventsAndStateExample } from './06-events-and-state'
import { runRunOrdersExample } from './07-run-orders'
import { runSpyExample } from './08-spy-functions'

async function runAllExamples() {
  console.log('\n' + '='.repeat(60))
  console.log('🧪 Universal Tests Runner - Examples Showcase')
  console.log('='.repeat(60))

  try {
    // Example 1: Basic Tests (describe, test, expectations)
    await runBasicTestsExample()
    await delay(1000)

    // Example 2: Test Lifecycle (before, after, beforeEach, afterEach)
    await runTestLifecycleExample()
    await delay(1000)

    // Example 3: All Matchers
    await runMatchersExample()
    await delay(1000)

    // Example 4: Mock Functions
    await runMockFunctionsExample()
    await delay(1000)

    // Example 5: Asymmetric Assertions
    await runAsymmetricAssertionsExample()
    await delay(1000)

    // Example 6: Events and State
    await runEventsAndStateExample()
    await delay(1000)

    // Example 7: Run Orders (sequence, random, parallel)
    await runRunOrdersExample()
    await delay(1000)

    // Example 8: Spy Functions
    await runSpyExample()

    console.log('\n' + '='.repeat(60))
    console.log('🎉 All examples completed successfully!')
    console.log('='.repeat(60))
  } catch (error) {
    console.error('\n💥 Error running examples:', error)
    console.log('='.repeat(60))
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

runAllExamples()
