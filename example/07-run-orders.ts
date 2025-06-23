import { TestsRunner } from '../src'

export async function runRunOrdersExample(): Promise<void> {
  console.log('🚀 Running Run Orders Example')
  console.log('='.repeat(50))

  // Example 1: Sequential (default)
  console.log('\n1️⃣  Sequential Run Order:')
  const testsRunner1 = new TestsRunner({
    identifier: 'sequence-example',
    runOrder: 'sequence'
  })
  await runSequentialExample(testsRunner1)

  // Example 2: Random order
  console.log('\n2️⃣  Random Run Order:')
  const testsRunner2 = new TestsRunner({
    identifier: 'random-example',
    runOrder: 'random'
  })
  await runRandomExample(testsRunner2)

  // Example 3: Parallel execution
  console.log('\n3️⃣  Parallel Run Order:')
  const testsRunner3 = new TestsRunner({
    identifier: 'parallel-example',
    runOrder: 'parallel'
  })
  await runParallelExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runSequentialExample(testsRunner: TestsRunner): Promise<void> {
  const executionOrder: string[] = []

  testsRunner.on('test:running', (event) => {
    executionOrder.push(event.payload.test.name)
    console.log(`  🏃 Running: ${event.payload.test.name}`)
  })

  testsRunner.describe('Sequential Tests', () => {
    testsRunner.test('Test A', async () => {
      await delay(50)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Test B', async () => {
      await delay(30)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Test C', async () => {
      await delay(40)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Test D', async () => {
      await delay(20)
      testsRunner.expect(true).toBe(true)
    })
  })

  const startTime = Date.now()
  await testsRunner.run()
  const duration = Date.now() - startTime

  console.log(`  📊 Execution order: ${executionOrder.join(' → ')}`)
  console.log(`  ⏱️  Total duration: ${duration}ms (sequential)`)
  console.log(`  📈 Status: ${testsRunner.status}`)
}

async function runRandomExample(testsRunner: TestsRunner): Promise<void> {
  const executionOrder: string[] = []

  testsRunner.on('test:running', (event) => {
    executionOrder.push(event.payload.test.name)
    console.log(`  🎲 Running: ${event.payload.test.name}`)
  })

  testsRunner.describe('Random Order Tests', () => {
    testsRunner.test('Alpha', () => {
      testsRunner.expect('alpha').toEqual('alpha')
    })

    testsRunner.test('Beta', () => {
      testsRunner.expect('beta').toEqual('beta')
    })

    testsRunner.test('Gamma', () => {
      testsRunner.expect('gamma').toEqual('gamma')
    })

    testsRunner.test('Delta', () => {
      testsRunner.expect('delta').toEqual('delta')
    })

    testsRunner.test('Epsilon', () => {
      testsRunner.expect('epsilon').toEqual('epsilon')
    })
  })

  await testsRunner.run()

  console.log(`  📊 Random execution order: ${executionOrder.join(' → ')}`)
  console.log(`  📈 Status: ${testsRunner.status}`)
  console.log(`  ℹ️  Note: Order will be different on each run`)
}

async function runParallelExample(testsRunner: TestsRunner): Promise<void> {
  const testStartTimes: Record<string, number> = {}
  const testEndTimes: Record<string, number> = {}

  testsRunner.on('test:running', (event) => {
    testStartTimes[event.payload.test.name] = Date.now()
    console.log(`  🚀 Started: ${event.payload.test.name}`)
  })

  testsRunner.on('test:succeeded', (event) => {
    testEndTimes[event.payload.test.name] = Date.now()
    console.log(`  ✅ Completed: ${event.payload.test.name}`)
  })

  testsRunner.describe('Parallel Tests', () => {
    testsRunner.test('Slow Test 1', async () => {
      await delay(100)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Fast Test 1', async () => {
      await delay(20)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Medium Test 1', async () => {
      await delay(60)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Fast Test 2', async () => {
      await delay(25)
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('Slow Test 2', async () => {
      await delay(90)
      testsRunner.expect(true).toBe(true)
    })
  })

  const startTime = Date.now()
  await testsRunner.run()
  const totalDuration = Date.now() - startTime

  console.log(`  ⏱️  Total parallel duration: ${totalDuration}ms`)
  console.log(`  📊 Individual test durations:`)

  Object.keys(testStartTimes).forEach((testName) => {
    const duration = testEndTimes[testName] - testStartTimes[testName]
    console.log(`    ${testName}: ${duration}ms`)
  })

  console.log(`  📈 Status: ${testsRunner.status}`)
  console.log(`  💡 Parallel execution is much faster than sequential`)
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
